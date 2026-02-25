import BorrowHistorySchema from "./BorrowHistorySchema.js";

// Create a new borrow history record
export const createBorrowHistoryModel = (borrowObj) => {
  return BorrowHistorySchema(borrowObj).save();
};

// Get my borrow history (logged in user)
export const getMyBorrowHistoryModel = (userId) => {
  return (
    BorrowHistorySchema.find({ userId })
      .sort({ borrowDate: -1 }) //last borr first
      //Add field from Book
      .populate("bookId", "title coverImageUrl typeEdition")
      //Add fiels from Review
      .populate("reviewId", "rating title comment status")
  );
};

// Get all borrow history records (admin/librarian)
export const getAllBorrowsModel = (filter = {}) => {
  return BorrowHistorySchema.find(filter)
    .sort({ createdAt: -1 })
    .populate("userId", "fName lName email status role")
    .populate("bookId", "title typeEdition coverImageUrl")
    .populate("reviewId", "rating title comment status")
    .populate("createdById", "fName lName email role")
    .populate("returnedById", "email");
};

//WHEN CREATED THE REVIEW
//Update by member logged -> change status to {status: reviewed} only
export const updateBorrowHistoryModel = (borrowId, updatedObj) => {
  return BorrowHistorySchema.findByIdAndUpdate(borrowId, updatedObj, {
    new: true,
  });
};

//Update by admin logged -> change status to {returned} only
export const adminReturnBorrowModel = (borrowId, adminId) => {
  return BorrowHistorySchema.findOneAndUpdate(
    {
      _id: borrowId,
      status: { $in: ["borrowed", "overdue"] },
    },
    {
      status: "returned",
      returnDate: new Date(),
      returnedById: adminId,
    },
    { new: true }
  );
};

export const getBorrowByIdModel = (borrowId) => {
  return BorrowHistorySchema.findById(borrowId);
};

//???? Update borrowRecord for the logged In user -> User does not modify his Borrows??????????????????????????????????????????
export const updateMyBorrowHistoryModel = (borrowId, userId, updatedObj) => {
  return BorrowHistorySchema.findOneAndUpdate(
    {
      _id: borrowId,
      userId,
      status: { $in: ["borrowed", "overdue"] },
    },
    updatedObj,
    { new: true }
  );
};

//Detect expire books
export const getExpiredEbookBorrowsModel = () => {
  return BorrowHistorySchema.find({
    status: { $in: ["borrowed", "overdue"] },
    typeEdition: "Ebook",
    dueDate: { $lte: new Date() },
  });
};

//make Ebook which are overdue -> autoreturn
export const autoReturnBorrowModel = (borrowId) => {
  return BorrowHistorySchema.findOneAndUpdate(
    {
      _id: borrowId,
      status: { $in: ["borrowed", "overdue"] },
    },
    {
      status: "returned",
      returnDate: new Date(),
      returnedById: null,
    },
    { new: true }
  );
};
