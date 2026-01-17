import {
  addBookModel,
  getAllBooksModel,
  getBookByIdModel,
  updateBookModel,
  deleteBookModel,
} from "../models/Book/BookModel.js";
import { getAllReviewsModel } from "../models/Review/ReviewModel.js";

////////////////////////////////////////////////Public
// for searching in public books
export const searchPublicBooksController = async (req, res, next) => {
  try {
    //extract atributes form searching
    const { title, author, genre, typeEdition, language, q } = req.query;

    const filter = {
      status: "active",
    };
    //RegExp: allows partial matching
    //Find books where the title contains the search text, and ignore case sensitivity=i
    if (title) filter.title = new RegExp(title, "i");
    if (author) filter.author = new RegExp(author, "i");

    //Requires exact match -> good for dropdown menus
    if (genre) filter.genre = genre;
    if (typeEdition) filter.typeEdition = typeEdition;
    if (language) filter.language = language;

    //Find books where "q" matches the title OR author OR isbn (case-insensitive)-> partial matching included when using RegExp
    if (q) {
      filter.$or = [
        { title: new RegExp(q, "i") },
        { author: new RegExp(q, "i") },
        { isbn: new RegExp(q, "i") },
      ];
    }

    //pagination: page; request for page: p1,p2,p3... etc
    const page = parseInt(req.query.page || "1", 10);

    //limit, skip, sort;
    const limit = parseInt(req.query.limit || "10", 10); // items show per page
    const skip = (page - 1) * limit; //how may items skip at the beggining
    //page = which page user wants
    //limit = how many items per page
    //skip = how many items to ignore based on current page

    //sort
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // run in parallell: getAllBooksModel + countDocuments
    // total=total of results that match the filter
    const [books, total] = await Promise.all([
      getAllBooksModel(filter, limit, skip, sort),
      // count for pagination
      import("../models/Book/BookSchema.js").then(({ default: BookSchema }) =>
        BookSchema.countDocuments(filter)
      ),
    ]);

    return res.status(200).json({
      status: "success",
      message: "Public books found in the search",
      data: books,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
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

////////////////////////////////////////////////Admin
export const addBookController = async (req, res, next) => {
  try {
    // 1. get new book object
    const bookObj = { ...req.body };

    //2. Check on quantityTotal, then assign value to quantityAvailable
    if (
      typeof bookObj.quantityTotal === "number" &&
      bookObj.quantityTotal >= 0 &&
      bookObj.quantityAvailable == null
    ) {
      bookObj.quantityAvailable = bookObj.quantityTotal;
    } else {
      return res.status(400).json({
        status: "error",
        message: "Total quantity does not meet requirements",
      });
    }

    //3. Set isAvailable
    if (typeof bookObj.quantityAvailable === "number") {
      bookObj.isAvailable = bookObj.quantityAvailable > 0;
    }

    //4. Create new book
    const newBook = await addBookModel(bookObj);

    return res.status(201).json({
      status: "success",
      message: "Book added sucessfully",
      data: newBook,
    });
  } catch (error) {
    // Error handler for duplicate ISBN
    if (error?.code === 11000 && error?.keyPattern?.isbn) {
      return res.status(400).json({
        status: "error",
        message: "A book with this ISBN already exists",
      });
    }

    next(error);
  }
};

// for searching in All books -> ADMIN
export const searchAllBooksController = async (req, res, next) => {
  try {
    const { title, author, genre, typeEdition, language, status } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (title) filter.title = new RegExp(title, "i");
    if (author) filter.author = new RegExp(author, "i");
    if (genre) filter.genre = genre;
    if (typeEdition) filter.typeEdition = typeEdition;
    if (language) filter.language = language;

    if (q) {
      filter.$or = [
        { title: new RegExp(q, "i") },
        { author: new RegExp(q, "i") },
        { isbn: new RegExp(q, "i") },
      ];
    }

    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const [books, total] = await Promise.all([
      getAllBooksModel(filter, limit, skip, sort),
      import("../models/Book/BookSchema.js").then(({ default: BookSchema }) =>
        BookSchema.countDocuments(filter)
      ),
    ]);

    return res.status(200).json({
      status: "success",
      message: "All Books found",
      data: books,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// get all books (admin) {active and inactive} ===> can be modify for search public or admin
export const getAllBooksController = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    // only modify filter if status is provided
    if (status === "active" || status === "inactive") {
      filter.status = status;
    }

    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const BookSchema = (await import("../models/Book/BookSchema.js")).default;

    const [books, total] = await Promise.all([
      getAllBooksModel(filter, limit, skip, sort),
      BookSchema.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: "success",
      message: "Admin Books retrieved successfully",
      data: books,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookByIdController = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    if (!bookId) {
      return res.status(400).json({
        status: "error",
        message: "Book ID is required",
      });
    }

    const book = await getBookByIdModel(bookId);

    if (!book) {
      return res.status(404).json({
        status: "error",
        message: "Book not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Book found",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookController = async (req, res, next) => {
  try {
  } catch (error) {}
};

export const deleteBookController = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    if (!bookId) {
      return res.status(400).json({
        status: "error",
        message: "Book ID is required, book not found",
      });
    }

    const deletedBook = await deleteBookModel(bookId);

    if (!deletedBook) {
      return res.status(404).json({
        status: "error",
        message: "Book not found or already deleted",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Book deleted successfully",
      //data: deletedbook,
      data: {
        _id: deletedBook._id,
        title: deletedBook.title,
        isbn: deletedBook.isbn,
      },
    });
  } catch (error) {
    next(error);
  }
};
