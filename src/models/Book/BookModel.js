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
export const getAllBooksModel = (filter, limit, skip, sort) => {
  return BookSchema.find(filter).limit(limit).skip(skip).sort(sort);
};

// read book by id
export const getBookByIdModel = (id) => {
  return BookSchema.findById(id);
};

//update book by id
export const updateBookModel = (id, updatedObj) => {
  return BookSchema.findByIdAndUpdate(id, updatedObj, { new: true });
};

// delete book by id
export const deleteBookModel = (id) => {
  return BookSchema.findByIdAndDelete(id);
};

//////Increase-decrease availability
// Decrement the availableBooks and return BookObject
export const reserveBookCopyModel = (bookId) => {
  return BookSchema.findOneAndUpdate(
    {
      _id: bookId,
      quantityAvailable: { $gt: 0 }, //not negatives
    },
    {
      $inc: { quantityAvailable: -1 },
    },
    {
      new: true,
    }
  );
};

// Increment availability and return BookObject
export const releaseBookCopyModel = (bookId) => {
  return BookSchema.findByIdAndUpdate(
    bookId,
    {
      $inc: { quantityAvailable: 1 },
    },
    {
      new: true,
    }
  );
};
