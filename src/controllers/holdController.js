import { calcDueDate } from "../config/helper.js";

import { getUserByIdModel } from "../models/User/UserModel.js";

import {
  getBookByIdModel,
  reserveBookCopyForHoldModel,
  reserveBookCopyModel,
  releaseBookCopyModel,
  updateBookModel,
} from "../models/Book/BookModel.js";

import {
  createHoldModel,
  findActiveHoldByUserAndBookModel,
  getMyHoldsModel,
  getAllHoldsModel,
  cancelHoldModel,
  fulfillHoldModel,
  countActiveHoldsByUserModel,
} from "../models/Hold/HoldModel.js";

import {
  countActivePhysicalByUserModel,
  countOverduePhysicalByUserModel,
  createBorrowHistoryModel,
} from "../models/Borrow/BorrowHistoryModel.js";

// 2 days hold
const HOLD_DAYS = 2;

const addDays = (d, days) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);

// MEMBER: place a hold (physical only)
export const createHoldController = async (req, res, next) => {
  try {
    const userId = req.userInfo?._id;
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const user = await getUserByIdModel(userId);
    if (!user)
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });

    if (user.status !== "active") {
      return res.status(403).json({
        status: "error",
        message: "Your account is not active. You cannot place holds.",
      });
    }

    const { bookId } = req.params;
    if (!bookId)
      return res
        .status(400)
        .json({ status: "error", message: "Book ID is required" });

    // prevent duplicate active hold
    const existing = await findActiveHoldByUserAndBookModel(userId, bookId);
    if (existing) {
      return res.status(400).json({
        status: "error",
        message: "You already have an active hold for this book",
      });
    }

    const book = await getBookByIdModel(bookId);
    if (!book)
      return res
        .status(404)
        .json({ status: "error", message: "Book not found" });

    // hold only for physical copies (not Ebook)
    if (book.typeEdition === "Ebook") {
      return res.status(400).json({
        status: "error",
        message: "Ebooks cannot be put on hold. Borrow it instead.",
      });
    }

    if (book.status !== "active") {
      return res
        .status(400)
        .json({ status: "error", message: "This book is not active" });
    }

    //block mre than 3 holds for user
    const activeHoldCount = await countActiveHoldsByUserModel(userId);
    if (activeHoldCount >= 3) {
      return res.status(400).json({
        status: "error",
        message: "Hold limit reached: you can only have up to 3 active holds",
      });
    }
    //cannot place a hold if already has 5 active borrows (borrowed+overdue) physical only
    const activePhysical = await countActivePhysicalByUserModel(userId);
    if (activePhysical >= 5) {
      return res.status(400).json({
        status: "error",
        message:
          "Cannot place hold: you already have 5 active physical borrows",
      });
    }

    // reserve quantity (atomic, not borrowed yet)
    const reserved = await reserveBookCopyForHoldModel(bookId);
    if (!reserved) {
      return res
        .status(400)
        .json({ status: "error", message: "No available copies to hold" });
    }

    const holdObj = {
      userId,
      bookId: reserved._id,
      bookTitle: reserved.title,
      bookAuthor: reserved.author,
      bookIsbn: reserved.isbn,
      typeEdition: reserved.typeEdition,
      coverImageUrl: reserved.coverImageUrl,
      memberEmail: user.email,
      holdDate: new Date(),
      expiresAt: addDays(new Date(), HOLD_DAYS),
      status: "active",
    };

    const hold = await createHoldModel(holdObj);

    return res.status(201).json({
      status: "success",
      message: "Hold created successfully (2 days)",
      data: hold,
    });
  } catch (error) {
    next(error);
  }
};

// MEMBER: my holds
export const getMyHoldsController = async (req, res, next) => {
  try {
    const userId = req.userInfo?._id;
    if (!userId)
      return res.status(401).json({ status: "error", message: "Unauthorized" });

    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const skip = (page - 1) * limit;

    const { items, total } = await getMyHoldsModel(userId, { skip, limit });

    return res.status(200).json({
      status: "success",
      message: "My holds retrieved successfully",
      data: {
        items,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        params: { page, limit },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelMyHoldController = async (req, res, next) => {
  try {
    const userId = req.userInfo?._id;
    if (!userId)
      return res.status(401).json({ status: "error", message: "Unauthorized" });

    const { holdId } = req.params;
    if (!holdId)
      return res
        .status(400)
        .json({ status: "error", message: "Hold ID is required" });

    const cancelled = await cancelHoldModel(holdId, userId);
    if (!cancelled) {
      return res
        .status(400)
        .json({ status: "error", message: "Hold cannot be cancelled" });
    }

    await releaseBookCopyModel(cancelled.bookId);

    return res.status(200).json({
      status: "success",
      message: "Hold cancelled and book released",
      data: cancelled,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: list holds (for management + dashboard)
export const getAllHoldsController = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const status = (req.query.status || "").trim();

    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    if (q) {
      const rx = new RegExp(q, "i");
      filter.$or = [
        { bookTitle: rx },
        { bookAuthor: rx },
        { bookIsbn: rx },
        { memberEmail: rx },
        { status: rx },
        { typeEdition: rx },
      ];
    }

    const { items, total } = await getAllHoldsModel(filter, { skip, limit });

    return res.status(200).json({
      status: "success",
      message: "All holds retrieved successfully",
      data: {
        items,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        params: { q, status, page, limit },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: fulfill hold -> create Borrow (without reserving again)
export const fulfillHoldToBorrowController = async (req, res, next) => {
  try {
    const adminId = req.userInfo?._id;
    if (!adminId)
      return res.status(401).json({ status: "error", message: "Unauthorized" });

    const adminUser = await getUserByIdModel(adminId);
    if (!adminUser)
      return res
        .status(404)
        .json({ status: "error", message: "Admin not found" });

    const { holdId } = req.params;
    if (!holdId)
      return res
        .status(400)
        .json({ status: "error", message: "Hold ID is required" });

    // we need the hold info, easier to populate via HoldSchema directly
    const Hold = (await import("../models/Hold/HoldSchema.js")).default;
    const hold = await Hold.findById(holdId);
    if (!hold)
      return res
        .status(404)
        .json({ status: "error", message: "Hold not found" });

    if (hold.status !== "active") {
      return res
        .status(400)
        .json({ status: "error", message: "Hold is not active" });
    }
    if (hold.expiresAt <= new Date()) {
      return res
        .status(400)
        .json({ status: "error", message: "Hold is expired" });
    }

    //user is active
    const user = await getUserByIdModel(hold.userId);
    if (!user)
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });

    if (user.status !== "active") {
      return res.status(403).json({
        status: "error",
        message: "User is not active and cannot borrow books",
      });
    }
    //enforce rules anyway of physical book holding
    const overduePhysical = await countOverduePhysicalByUserModel(hold.userId);
    if (overduePhysical > 0) {
      return res.status(400).json({
        status: "error",
        message: "Cannot fulfill hold: user has overdue physical borrows",
      });
    }

    const activePhysical = await countActivePhysicalByUserModel(hold.userId);
    if (activePhysical >= 5) {
      return res.status(400).json({
        status: "error",
        message:
          "Cannot fulfill hold: user already has 5 active physical borrows",
      });
    }

    // Create borrow WITHOUT reserving again (hold already reserved the copy before)
    const borrowRecord = await createBorrowHistoryModel({
      userId: hold.userId,
      createdById: adminId,
      bookId: hold.bookId,
      bookTitle: hold.bookTitle,
      typeEdition: hold.typeEdition,
      coverImageUrl: hold.coverImageUrl,
      borrowDate: new Date(),
      dueDate: calcDueDate(), // your normal due date (15 days)
      status: "borrowed",

      bookAuthor: hold.bookAuthor,
      bookIsbn: hold.bookIsbn,
      memberEmail: hold.memberEmail,
      createdByEmail: adminUser.email,
    });

    //increment times borrowed for popular books
    await updateBookModel(hold.bookId, { $inc: { timesBorrowed: 1 } });

    // mark hold as fulfilled and attach borrowId
    const fulfilled = await fulfillHoldModel(
      holdId,
      adminId,
      adminUser.email,
      borrowRecord._id
    );

    return res.status(201).json({
      status: "success",
      message: "Hold fulfilled -> Borrow created",
      data: { hold: fulfilled, borrow: borrowRecord },
    });
  } catch (error) {
    next(error);
  }
};
