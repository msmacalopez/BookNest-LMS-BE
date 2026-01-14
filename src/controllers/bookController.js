import { getAllBooksModel } from "../models/Book/BookModel";
import { getAllReviewsModel } from "../models/Review/ReviewModel";

export const addBookController = async (req, res, next) => {
  try {
  } catch (error) {}
};

// ?????????????
export const searchPublicBooksController = async (req, res, next) => {
  try {
  } catch (error) {}
};

// ?????????????
export const searchAllBooksController = async (req, res, next) => {
  try {
  } catch (error) {}
};

// get all public books (any)
export const getAllPublicBooksController = async (req, res, next) => {
  try {
    //get all books with status "active"
    const activeBooks = await getAllBooksModel({ status: "active" });
    const activeReviews = await getAllReviewsModel({ status: "active" });

    const booksWithReviews = activeBooks.map((item) => {
      return {
        ...(item.toObject?.() || item),
        activeReviews: activeReviews.filter(
          (r) => String(r.bookId) === String(item._id)
        ),
      };
    });

    return res.json({
      status: "success",
      message: "Books with Reviews Found",
      books: booksWithReviews,
    });
  } catch (error) {
    next(error);
  }
};

// get all books (admin) {active or inactive}
export const getAllBooksController = async (req, res, next) => {
  try {
  } catch (error) {}
};

export const getBookByIdController = async (req, res, next) => {
  try {
  } catch (error) {}
};

export const updateBookController = async (req, res, next) => {
  try {
  } catch (error) {}
};

export const deleteBookController = async (req, res, next) => {
  try {
  } catch (error) {}
};
