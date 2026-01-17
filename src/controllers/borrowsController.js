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

export const createBorrowController = async (req, res, next) => {
  try {
    // 1. userInfo from auth middleware
    const userId = req.userInfo?._id;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: Needs to log In",
      });
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

    // 4. Create borrow history (snapshot style)
    const borrowRecord = await createBorrowHistoryModel({
      userId,
      bookId: reservedBook._id,
      bookTitle: reservedBook.title,
      typeEdition: reservedBook.typeEdition,
      coverImageUrl: reservedBook.coverImageUrl,
      borrowDate: new Date(),
      dueDate: calcDueDate(),
      status: "borrowed",
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
    const borrows = await getMyBorrowHistoryModel(userId);
    return res.status(200).json({
      status: "success",
      message: "Borrow History retrieved successfully",
      data: borrows,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBorrowsController = async (req, res, next) => {
  try {
    const filter = {};

    const borrows = await getAllBorrowsModel(filter);

    return res.status(200).json({
      status: "success",
      message: "All borrow records retrieved Successfully",
      data: borrows,
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

    // 1. Update borrow: borrowed/overdue -> returned (add adminId, returnDate and returnedById)
    const updatedBorrow = await adminReturnBorrowModel(borrowId, adminId);

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
