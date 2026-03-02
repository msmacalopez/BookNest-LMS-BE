//BookModel.js
import BookSchema from "./BookSchema.js";

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
export const reserveBookCopyModel = (bookId) => {
  return BookSchema.findOneAndUpdate(
    {
      _id: bookId,
      status: "active",
      quantityAvailable: { $gt: 0 },
    },
    [
      {
        $set: {
          quantityAvailable: { $subtract: ["$quantityAvailable", 1] },
          timesBorrowed: { $add: ["$timesBorrowed", 1] },
        },
      },
      {
        $set: {
          isAvailable: { $gt: ["$quantityAvailable", 0] },
        },
      },
    ],
    { new: true }
  );
};

// Increment availability and return BookObject, works for holds
export const releaseBookCopyModel = (bookId) => {
  return BookSchema.findByIdAndUpdate(
    bookId,
    [
      {
        $set: {
          quantityAvailable: { $add: ["$quantityAvailable", 1] },
        },
      },
      {
        $set: {
          quantityAvailable: {
            $min: [{ $add: ["$quantityAvailable", 1] }, "$quantityTotal"],
          },
        },
      },
      {
        $set: {
          isAvailable: { $gt: ["$quantityAvailable", 0] },
        },
      },
    ],
    { new: true }
  );
};

////The following for Hold functionality:
// Reserve for HOLD-> decrement Availables only - does not increments timesBorrowed until fulfilled
export const reserveBookCopyForHoldModel = (bookId) => {
  return BookSchema.findOneAndUpdate(
    {
      _id: bookId,
      status: "active",
      quantityAvailable: { $gt: 0 },
    },
    [
      {
        $set: {
          quantityAvailable: { $subtract: ["$quantityAvailable", 1] },
        },
      },
      {
        $set: {
          isAvailable: { $gt: ["$quantityAvailable", 0] },
        },
      },
    ],
    { new: true }
  );
};

// Release but prevent exceeding total -> extra safe
export const releaseBookCopySafeModel = (bookId) => {
  return BookSchema.findOneAndUpdate(
    {
      _id: bookId,
      quantityAvailable: { $lt: "$quantityTotal" },
    },
    { $inc: { quantityAvailable: 1 } },
    { new: true }
  );
};
