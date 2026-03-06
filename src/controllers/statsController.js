//statsController.js
import Borrow from "../models/Borrow/BorrowHistorySchema.js";
import Book from "../models/Book/BookSchema.js";
import User from "../models/User/UserSchema.js";
import Hold from "../models/Hold/HoldSchema.js";

const RANGE_MAP = {
  all: null,
  7: 7,
  14: 14,
  30: 30,
  180: 180, //6 months
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

const formatDateKey = (date) => {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
};

export const getBorrowingTrendsController = async (req, res, next) => {
  try {
    const range = String(req.query.range || "14");
    const days = RANGE_MAP[range] || 14;

    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const borrowedAgg = await Borrow.aggregate([
      {
        $match: {
          borrowDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$borrowDate",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const returnedAgg = await Borrow.aggregate([
      {
        $match: {
          returnDate: { $ne: null, $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$returnDate",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

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
      message: "Borrowing trends fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryDistributionController = async (req, res, next) => {
  try {
    const categoryAgg = await Book.aggregate([
      {
        $group: {
          _id: "$genre",
          value: { $sum: 1 }, // count book titles
        },
      },
      { $sort: { value: -1 } },
    ]);

    const data = categoryAgg.map((item, index) => ({
      name: item._id || "Unknown",
      value: item.value,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }));

    return res.status(200).json({
      status: "success",
      message: "Category distribution fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardBorrowStatsController = async (req, res, next) => {
  try {
    const range = String(req.query.range || "all"); // all | 7 | 14 | 30 | 180
    const now = new Date();

    // ---------------------------
    // Borrow stats
    // ---------------------------
    const [borrowedNow, overdueNow, holdsNow] = await Promise.all([
      Borrow.countDocuments({
        returnDate: null,
        dueDate: { $gte: now },
        status: { $in: ["borrowed", "overdue"] },
      }),
      Borrow.countDocuments({
        returnDate: null,
        dueDate: { $lt: now },
        status: { $in: ["borrowed", "overdue"] },
      }),
      Hold.countDocuments({
        status: "active",
      }),
    ]);

    const days = RANGE_MAP[range];
    let start = null;
    if (days) {
      start = new Date(now);
      start.setDate(now.getDate() - days);
    }

    const borrowedFilter = start
      ? { borrowDate: { $gte: start, $lte: now } }
      : {};
    const returnedFilter = start
      ? { returnDate: { $ne: null, $gte: start, $lte: now } }
      : { returnDate: { $ne: null } };

    const [borrowedCount, returnedCount] = await Promise.all([
      Borrow.countDocuments(borrowedFilter),
      Borrow.countDocuments(returnedFilter),
    ]);

    // ---------------------------
    // Book stats
    // ---------------------------
    const [booksActive, booksInactive] = await Promise.all([
      Book.countDocuments({ status: "active" }),
      Book.countDocuments({ status: "inactive" }),
    ]);

    // ---------------------------
    // User stats
    // ---------------------------
    const memberStatus = String(req.query.memberStatus || "active"); // active|inactive|suspended|deactivated
    const adminStatus = String(req.query.adminStatus || "active");

    const validStatuses = ["active", "inactive", "suspended", "deactivated"];
    const safeMemberStatus = validStatuses.includes(memberStatus)
      ? memberStatus
      : "active";
    const safeAdminStatus = validStatuses.includes(adminStatus)
      ? adminStatus
      : "active";

    const [membersTotal, membersByStatus, adminsTotal, adminsByStatus] =
      await Promise.all([
        User.countDocuments({ role: "member" }),
        User.countDocuments({ role: "member", status: safeMemberStatus }),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ role: "admin", status: safeAdminStatus }),
      ]);

    return res.status(200).json({
      status: "success",
      data: {
        now: { borrowedNow, overdueNow, holdsNow },

        totals: { borrowedCount, returnedCount, range },

        books: { booksActive, booksInactive },

        users: {
          membersTotal,
          membersByStatus: { status: safeMemberStatus, count: membersByStatus },
          adminsTotal,
          adminsByStatus: { status: safeAdminStatus, count: adminsByStatus },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLanguageDistributionController = async (req, res, next) => {
  try {
    const data = await Book.aggregate([
      {
        $group: {
          _id: "$language",
          value: { $sum: 1 },
        },
      },
      { $sort: { value: -1, _id: 1 } },
    ]);

    const formatted = data.map((item) => ({
      name: item._id || "Unknown",
      value: item.value,
    }));

    return res.status(200).json({
      status: "success",
      message: "Language distribution fetched successfully",
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

export const getTypeEditionDistributionController = async (req, res, next) => {
  try {
    const data = await Book.aggregate([
      {
        $group: {
          _id: "$typeEdition",
          value: { $sum: 1 },
        },
      },
      { $sort: { value: -1, _id: 1 } },
    ]);

    const formatted = data.map((item) => ({
      name: item._id || "Unknown",
      value: item.value,
    }));

    return res.status(200).json({
      status: "success",
      message: "Type edition distribution fetched successfully",
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};
