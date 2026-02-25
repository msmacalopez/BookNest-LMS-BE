import ReviewSchema from "./ReviewSchema.js";

//by member
//Create a new review
export const createReviewModel = (reviewObj) => {
  return ReviewSchema(reviewObj).save();
};

//by admin
//Get review by BorrowId -> 1 result
export const getReviewByBorrowIdModel = (borrowId) => {
  return ReviewSchema.findOne({ borrowId });
};

// Get reviews by BookId -> can be many results
// export const getReviewsByBookModel = (bookId) => {
//   return ReviewSchema.find({ book: bookId })
//     .populate("user", "name email")
//     .exec();
// };

//Get my reviews!!
// Get reviews by user ID -> can be many
export const getActiveReviewsByUserIdModel = async (
  userId,
  { skip = 0, limit = 10 } = {}
) => {
  const filter = { userId, status: "active" };

  const [items, total] = await Promise.all([
    ReviewSchema.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("bookId", "title author coverImageUrl typeEdition")
      .populate("borrowId", "borrowDate returnDate"),
    ReviewSchema.countDocuments(filter),
  ]);

  return { items, total };
};

// Get all reviews (can filter reviews by borrowID, etc)
export const getAllReviewsModel = (filter) => {
  return ReviewSchema.find(filter);
};

//Admin make review active
// Update a review by ID -> activate the review
export const updateReviewModel = (reviewId, updateObj) => {
  return ReviewSchema.findByIdAndUpdate(reviewId, updateObj, { new: true });
};

// Get all *active* reviews for a given book
export const getActiveReviewsByBookIdModel = (bookId) => {
  return ReviewSchema.find({ bookId, status: "active" })
    .sort({ createdAt: -1 })
    .populate("userId", "fName lName"); // who wrote the review
};
