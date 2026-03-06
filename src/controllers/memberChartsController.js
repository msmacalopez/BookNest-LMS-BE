import {
  getBorrowingTrendsByUserModel,
  getGenreDistributionByUserModel,
} from "../models/Borrow/BorrowHistoryModel.js";

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
