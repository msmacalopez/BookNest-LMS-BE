import mongoose from "mongoose";
import BorrowHistorySchema from "../models/Borrow/BorrowHistorySchema.js";
import {
  getRecommendedBooksByGenresModel,
  getTopPopularActiveBooksModel,
} from "../models/Book/BookModel.js";

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
