import BorrowHistoryModel from "./BorrowHistorySchema.js";

// Create a new borrow history record
export const createBorrowHistoryModel = (borrowObj) => {
  return BorrowHistoryModel(borrowObj).save();
};

// Get my borrow history
export const getMyBorrowHistoryModel = (userId) => {
  return BorrowHistoryModel.find({ user: userId }).populate("book");
};

// Get all borrow history records (empty or filter)
export const getAllBorrowsModel = (filter) => {
  return BorrowHistoryModel.find(filter).populate("book user");
};

// Update a borrow record {status: returned, etc}
export const updateBorrowHistoryModel = (borrowId, updatedObj) => {
  return BorrowHistoryModel.findByIdAndUpdate(borrowId, updatedObj, {
    new: true,
  });
};
