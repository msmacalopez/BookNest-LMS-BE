import mongoose from "mongoose";
import BorrowHistorySchema from "../models/Borrow/BorrowHistorySchema.js";
import {
  getRecommendedBooksByGenresModel,
  getTopPopularActiveBooksModel,
} from "../models/Book/BookModel.js";
import { getUserByIdModel } from "../models/User/UserModel.js";
import {
  countActivePhysicalByUserModel,
  countOverduePhysicalByUserModel,
  countTotalBorrowsByUserModel,
  countReturnedBorrowsByUserModel,
  getNextDueBorrowByUserModel,
  getFavoriteGenreByUserModel,
  getBorrowingTrendsByUserModel,
  getGenreDistributionByUserModel,
} from "../models/Borrow/BorrowHistoryModel.js";
import { countActiveHoldsByUserModel } from "../models/Hold/HoldModel.js";
import { countActiveReviewsByUserModel } from "../models/Review/ReviewModel.js";

const getDayDiff = (targetDate, nowDate) => {
  const oneDay = 24 * 60 * 60 * 1000;

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const now = new Date(nowDate);
  now.setHours(0, 0, 0, 0);

  return Math.ceil((target - now) / oneDay);
};

export const getMemberDashboardStatsController = async (req, res, next) => {
  try {
    const userId = req.userInfo?._id;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const now = new Date();

    const [
      user,
      borrowedNow,
      overdueNow,
      holdsNow,
      totalBorrowed,
      totalReturned,
      reviewsWritten,
      nextDueBorrow,
      favoriteGenre,
    ] = await Promise.all([
      getUserByIdModel(userId),
      countActivePhysicalByUserModel(userId),
      countOverduePhysicalByUserModel(userId),
      countActiveHoldsByUserModel(userId),
      countTotalBorrowsByUserModel(userId),
      countReturnedBorrowsByUserModel(userId),
      countActiveReviewsByUserModel(userId),
      getNextDueBorrowByUserModel(userId),
      getFavoriteGenreByUserModel(userId),
    ]);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    let nextDue = null;

    if (nextDueBorrow) {
      const daysRemaining = getDayDiff(nextDueBorrow.dueDate, now);

      let urgencyText = "";
      let urgencyType = "normal";

      if (daysRemaining < 0) {
        urgencyText = `Overdue by ${Math.abs(daysRemaining)} day${
          Math.abs(daysRemaining) === 1 ? "" : "s"
        }`;
        urgencyType = "overdue";
      } else if (daysRemaining === 0) {
        urgencyText = "Due today";
        urgencyType = "today";
      } else {
        urgencyText = `${daysRemaining} day${
          daysRemaining === 1 ? "" : "s"
        } left`;
        urgencyType = "upcoming";
      }

      nextDue = {
        borrowId: nextDueBorrow._id,
        bookId: nextDueBorrow.bookId?._id || null,
        title:
          nextDueBorrow.bookTitle || nextDueBorrow.bookId?.title || "Untitled",
        author: nextDueBorrow.bookAuthor || nextDueBorrow.bookId?.author || "",
        coverImageUrl:
          nextDueBorrow.coverImageUrl ||
          nextDueBorrow.bookId?.coverImageUrl ||
          "",
        dueDate: nextDueBorrow.dueDate,
        daysRemaining,
        urgencyText,
        urgencyType,
      };
    }

    return res.status(200).json({
      status: "success",
      message: "Member dashboard stats fetched successfully",
      data: {
        nextDue,
        live: {
          borrowedNow,
          overdueNow,
          holdsNow,
          memberStatus: user.status,
        },
        totals: {
          totalBorrowed,
          totalReturned,
          reviewsWritten,
          favoriteGenre: favoriteGenre?._id || "No reading history yet",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

//member recommendations
export const getMemberRecommendationsController = async (req, res, next) => {
  try {
    const userId = req.userInfo?._id;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const borrowHistory = await BorrowHistorySchema.find({ userId }).select(
      "bookId"
    );

    const borrowedBookIds = [
      ...new Set(
        borrowHistory.map((item) => item.bookId?.toString()).filter(Boolean)
      ),
    ].map((id) => new mongoose.Types.ObjectId(id));

    const topGenresAgg = await BorrowHistorySchema.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(String(userId)),
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "bookId",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: "$book" },
      {
        $group: {
          _id: "$book.genre",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 2 },
    ]);

    const favoriteGenres = topGenresAgg.map((item) => item._id).filter(Boolean);

    let recommendations = [];

    if (favoriteGenres.length > 0) {
      recommendations = await getRecommendedBooksByGenresModel(
        favoriteGenres,
        borrowedBookIds,
        5
      );
    }

    if (!recommendations.length) {
      recommendations = await getTopPopularActiveBooksModel(5);
    }

    return res.status(200).json({
      status: "success",
      message: "Member recommendations fetched successfully",
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

//member charts
const RANGE_MAP = {
  7: 7,
  14: 14,
  30: 30,
  180: 180,
};

const PIE_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#6366f1",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
  "#84cc16",
  "#f97316",
  "#06b6d4",
];

const formatDateKey = (date) => date.toISOString().slice(0, 10);

export const getMemberBorrowingTrendsController = async (req, res, next) => {
  try {
    const userId = req.userInfo?._id;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const range = String(req.query.range || "14");
    const days = RANGE_MAP[range] || 14;

    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const { borrowedAgg, returnedAgg } = await getBorrowingTrendsByUserModel(
      userId,
      start,
      end
    );

    const borrowedMap = new Map(
      borrowedAgg.map((item) => [item._id, item.count])
    );
    const returnedMap = new Map(
      returnedAgg.map((item) => [item._id, item.count])
    );

    const data = [];

    for (let i = 0; i < days; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);

      const key = formatDateKey(current);

      data.push({
        date: key,
        borrowed: borrowedMap.get(key) || 0,
        returned: returnedMap.get(key) || 0,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Member borrowing trends fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getMemberGenreDistributionController = async (req, res, next) => {
  try {
    const userId = req.userInfo?._id;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const genreAgg = await getGenreDistributionByUserModel(userId);

    const data = genreAgg.map((item, index) => ({
      name: item._id || "Unknown",
      value: item.value,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }));

    return res.status(200).json({
      status: "success",
      message: "Member genre distribution fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
