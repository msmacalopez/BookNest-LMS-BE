//BookModel.js
import BookSchema from "./BookSchema.js";
//whn update the average rating, we need :
import ReviewSchema from "../Review/ReviewSchema.js";
import mongoose from "mongoose";

// create a book
export const addBookModel = (obj) => {
  return BookSchema(obj).save();
};

// read all public books (any)
// export const getAllPublicBooksModel = (filter, limit, skip, sort) => {
//   return BookSchema.find(filter).limit(limit).skip(skip).sort(sort);
// };

// export const getAllBooks = (filter) => {
//   return BookSchema.find(filter);
// };

// read all books (admin) {active or inactive}
// export const getAllBooksModel = (filter, limit, skip, sort) => {
//   return BookSchema.find(filter).limit(limit).skip(skip).sort(sort);
// };

// read all books (admin or generic) with pagination/sort support
export const getAllBooksModel = (filter = {}, limit, skip, sort) => {
  let query = BookSchema.find(filter);

  if (limit) query = query.limit(limit);
  if (skip) query = query.skip(skip);
  if (sort) query = query.sort(sort);

  return query;
};

// read book by id
export const getBookByIdModel = (id) => {
  return BookSchema.findOne({ _id: id });
};

//active only
export const getActiveBookByIdModel = (id) => {
  return BookSchema.findOne({ _id: id, status: "active" });
};

//update book by id
export const updateBookModel = (id, updatedObj) => {
  return BookSchema.findByIdAndUpdate(id, updatedObj, { new: true });
};

// delete book by id
export const deleteBookModel = (id) => {
  return BookSchema.findByIdAndDelete(id);
};

//////Increase-decrease availability , works for holds
// Decrement the availableBooks and return BookObject
// Increment the timesBorrowed as well
export const reserveBookCopyModel = async (bookId) => {
  const book = await BookSchema.findOneAndUpdate(
    {
      _id: bookId,
      quantityAvailable: { $gt: 0 },
    },
    {
      $inc: {
        quantityAvailable: -1,
        timesBorrowed: 1,
      },
    },
    { new: true }
  );

  if (!book) return null;

  // keep isAvailable in sync
  const shouldBeAvailable = book.quantityAvailable > 0;
  if (book.isAvailable !== shouldBeAvailable) {
    book.isAvailable = shouldBeAvailable;
    await book.save();
  }

  return book;
};

// Increment availability and return BookObject, works for holds
export const releaseBookCopyModel = async (bookId) => {
  const book = await BookSchema.findByIdAndUpdate(
    bookId,
    { $inc: { quantityAvailable: 1 } },
    { new: true }
  );

  if (!book) return null;

  // keep isAvailable in sync
  const shouldBeAvailable = book.quantityAvailable > 0;
  if (book.isAvailable !== shouldBeAvailable) {
    book.isAvailable = shouldBeAvailable;
    await book.save();
  }

  return book;
};
////The following for Hold functionality:
// Reserve for HOLD-> decrement Availables only - does not increments timesBorrowed until fulfilled
export const reserveBookCopyForHoldModel = async (bookId) => {
  const book = await BookSchema.findOneAndUpdate(
    {
      _id: bookId,
      quantityAvailable: { $gt: 0 },
    },
    {
      $inc: {
        quantityAvailable: -1,
      },
    },
    { new: true }
  );

  if (!book) return null;

  // keep isAvailable in sync
  const shouldBeAvailable = book.quantityAvailable > 0;
  if (book.isAvailable !== shouldBeAvailable) {
    book.isAvailable = shouldBeAvailable;
    await book.save();
  }

  return book;
};

// Release but prevent exceeding total -> extra safe
//can generate error in mongo
// export const releaseBookCopySafeModel = (bookId) => {
//   return BookSchema.findOneAndUpdate(
//     {
//       _id: bookId,
//       quantityAvailable: { $lt: "$quantityTotal" },
//     },
//     { $inc: { quantityAvailable: 1 } },
//     { new: true }
//   );
// };

//Update Average Rating
// Recalculate whn review turns ACTIVE
export const recalcAverageRatingForBookModel = async (bookId) => {
  const _bookId = new mongoose.Types.ObjectId(String(bookId));

  const stats = await ReviewSchema.aggregate([
    {
      $match: {
        bookId: _bookId,
        status: "active",
      },
    },
    {
      $group: {
        _id: "$bookId",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = stats?.[0]?.avg ?? 0;
  const count = stats?.[0]?.count ?? 0;

  //ONE decimal
  const rounded = Number(avg.toFixed(1));

  await BookSchema.findByIdAndUpdate(_bookId, {
    averageRating: rounded,
    reviewsCount: count,
  });

  return {
    averageRating: rounded,
    reviewsCount: count,
  };
};

export const getBookByIsbnModel = (isbn) => {
  const q = String(isbn || "").trim();

  return BookSchema.findOne({
    isbn: new RegExp(`^${q}$`, "i"),
  });
};
