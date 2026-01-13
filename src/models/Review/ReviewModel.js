import ReviewSchema from "./ReviewModel.js";

//Create a new review
export const createReviewModel = (reviewObj) => {
  return ReviewSchema(reviewObj).save();
};

// Get reviews by book ID
export const getReviewsByBookModel = (bookId) => {
  return ReviewSchema.find({ book: bookId })
    .populate("user", "name email")
    .exec();
};

// Get reviews by user ID
export const getReviewsByUserModel = (userId) => {
  return ReviewSchema.find({ user: userId })
    .populate("book", "title author")
    .exec();
};

// Get all reviews (can filter reviews by borrowID, etc)
export const getAllReviewsModel = (filter) => {
  return ReviewSchema.find(filter);
};

// Update a review by ID -> activate the review
export const updateReviewModel = (reviewId, updateObj) => {
  return ReviewSchema.findByIdAndUpdate(reviewId, updateObj, { new: true });
};
