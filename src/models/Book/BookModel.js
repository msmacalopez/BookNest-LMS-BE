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

//////Increase-decrease availability
// Decrement the availableBooks and return BookObject
// Increment the timesBorrowed as well
export const reserveBookCopyModel = (bookId) => {
  return BookSchema.findOneAndUpdate(
    {
      _id: bookId,
      quantityAvailable: { $gt: 0 }, //not negatives
    },
    {
      $inc: {
        quantityAvailable: -1,
        timesBorrowed: 1,
      },
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
