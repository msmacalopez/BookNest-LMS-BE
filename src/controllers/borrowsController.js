import { calcDueDate } from "../config/helper.js";

// From Book Model
import {
  getBookByIdModel,
  reserveBookCopyModel,
  releaseBookCopyModel,
  updateBookModel,
} from "../models/Book/BookModel.js";

// From BorrowHistory Model
import {
  createBorrowHistoryModel,
  getMyBorrowHistoryModel,
  getAllBorrowsModel,
  adminReturnBorrowModel,
} from "../models/Borrow/BorrowHistoryModel.js";
import { getUserByIdModel } from "../models/User/UserModel.js";

// create borrow for himself
export const createMyBorrowController = async (req, res, next) => {
  try {
    // 1. userInfo from auth middleware
    const userId = req.userInfo?._id;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: Needs to log In",
      });
    }

    const user = await getUserByIdModel(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    // 2. bookId from params
    const { bookId } = req.params;
    if (!bookId) {
      return res.status(400).json({
        status: "error",
        message: "No BookID entered",
      });
    }
    // ReviewId is not needed

    // 3. Try to reserve Book
    const reservedBook = await reserveBookCopyModel(bookId);
    if (!reservedBook) {
      return res.status(400).json({
        status: "error",
        message: "No available copies for this volume",
      });
    }

    // member can only borrow Ebook
    if (reservedBook.typeEdition !== "Ebook") {
      return res.status(403).json({
        status: "error",
        message: "Members can only borrow Ebook editions",
      });
    }

    //TODO
    // 4. Create borrow history (snapshot style)
    const borrowRecord = await createBorrowHistoryModel({
      userId,
      bookId: reservedBook._id,
      bookTitle: reservedBook.title,
      typeEdition: reservedBook.typeEdition,
      coverImageUrl: reservedBook.coverImageUrl,
      borrowDate: new Date(),
      dueDate: calcDueDate(0.001),
      status: "borrowed",
      createdById: userId,

      bookAuthor: reservedBook.author,
      bookIsbn: reservedBook.isbn,
      memberEmail: user.email,
      createdByEmail: user.email,
    });

    // 5. Return response to front-end
    return res.status(201).json({
      status: "success",
      message: "Book borrowed successfully",
      data: borrowRecord,
    });
  } catch (error) {
    next(error);
  }
};

// create borrow a user -> by admin-librarian
export const createBorrowForUserController = async (req, res, next) => {
  try {
    // 1. Admin info from auth middleware (already enforced by isAdmin on route)
    const adminId = req.userInfo?._id;
    if (!adminId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: Needs to log in as admin",
      });
    }

    const adminUser = await getUserByIdModel(adminId);
    if (!adminUser) {
      return res
        .status(404)
        .json({ status: "error", message: "Admin not found" });
    }

    // 2. Borrower userId and bookId from params
    const { userId, bookId } = req.params;
    if (!userId || !bookId) {
      return res.status(400).json({
        status: "error",
        message: "Both userId and bookId are required",
      });
    }

    // 3. Ensure user exists and is active (optional but good)
    const user = await getUserByIdModel(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.status && user.status !== "active") {
      return res.status(400).json({
        status: "error",
        message: "User is not active and cannot borrow books",
      });
    }

    // 4. Try to reserve a copy of the book
    const reservedBook = await reserveBookCopyModel(bookId);
    if (!reservedBook) {
      return res.status(400).json({
        status: "error",
        message: "No available copies for this volume",
      });
    }

    // 5. Create borrow history (snapshot style)
    const borrowRecord = await createBorrowHistoryModel({
      userId,
      createdById: adminId,
      bookId: reservedBook._id,
      bookTitle: reservedBook.title,
      typeEdition: reservedBook.typeEdition,
      coverImageUrl: reservedBook.coverImageUrl,
      borrowDate: new Date(),
      dueDate: calcDueDate(),
      status: "borrowed",
      createdById: adminId,

      bookAuthor: reservedBook.author,
      bookIsbn: reservedBook.isbn,
      memberEmail: user.email,
      createdByEmail: adminUser.email,
    });

    // 6. Return response
    return res.status(201).json({
      status: "success",
      message: "Book borrowed successfully for user",
      data: borrowRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBorrowsController = async (req, res, next) => {
  try {
    //get user Id from auth
    const userId = req.userInfo?._id;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: Needs to log in",
      });
    }

    //pagination: page; request for page: p1,p2,p3... etc
    const page = parseInt(req.query.page || "1", 10);

    //limit, skip, sort;
    const limit = parseInt(req.query.limit || "10", 10); // items show per page
    const skip = (page - 1) * limit; //how may items skip at the beggining
    //page = which page user wants
    //limit = how many items per page
    //skip = how many items to ignore based on current page

    const { items, total } = await getMyBorrowHistoryModel(userId, {
      skip,
      limit,
    });

    return res.status(200).json({
      status: "success",
      message: "Borrow History retrieved successfully",
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
        params: { page, limit, sortBy: "borrowDate", sortOrder: "desc" },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBorrowsController = async (req, res, next) => {
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
        { createdByEmail: rx },
        { returnedByEmail: rx },
        { status: rx },
        { typeEdition: rx },
      ];
    }

    const { items, total } = await getAllBorrowsModel(filter, { skip, limit });

    return res.status(200).json({
      status: "success",
      message: "All borrow records retrieved Successfully",
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
        params: { q, status, page, limit },
      },
    });
  } catch (error) {
    next(error);
  }
};

//Update by admin-librarian -> return books
export const adminReturnBookController = async (req, res, next) => {
  try {
    // adminId from auth
    const adminId = req.userInfo?._id;

    //bookId from params
    const { borrowId } = req.params;

    if (!adminId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: Needs to log in",
      });
    }

    if (!borrowId) {
      return res.status(400).json({
        status: "error",
        message: "Bad Request: Borrow ID is required",
      });
    }

    const adminUser = await getUserByIdModel(adminId);
    if (!adminUser) {
      return res
        .status(404)
        .json({ status: "error", message: "Admin not found" });
    }

    // 1. Update borrow: borrowed/overdue -> returned (add adminId, returnDate and returnedById)
    const updatedBorrow = await adminReturnBorrowModel(
      borrowId,
      adminId,
      adminUser.email
    );
    if (!updatedBorrow) {
      return res.status(400).json({
        status: "error",
        message: "Bad Request: Volume not able to be returned",
      });
    }

    // 2. Increase book availability
    await releaseBookCopyModel(updatedBorrow.bookId);

    return res.status(200).json({
      status: "success",
      message: "Book returned successfully",
      data: updatedBorrow,
    });
  } catch (error) {
    next(error);
  }
};
