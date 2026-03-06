import { getUserByIdModel } from "../models/User/UserModel.js";
import {
  countActivePhysicalByUserModel,
  countOverduePhysicalByUserModel,
  countTotalBorrowsByUserModel,
  countReturnedBorrowsByUserModel,
  getNextDueBorrowByUserModel,
  getFavoriteGenreByUserModel,
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
