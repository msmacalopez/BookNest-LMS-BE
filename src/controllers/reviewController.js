import {
  createReviewModel,
  getReviewByBorrowIdModel,
  getActiveReviewsByBookIdModel,
  getActiveReviewsByUserIdModel,
  getAllReviewsModel,
  updateReviewModel,
} from "../models/Review/ReviewModel.js";

import {
  getBorrowByIdModel,
  updateBorrowHistoryModel,
} from "../models/Borrow/BorrowHistoryModel.js";

//////////////////////public
//to display in Book -> only active reviews
export const getReviewsByBookController = async (req, res, next) => {
  try {
    //get bookId
    const { bookId } = req.params;
    if (!bookId) {
      return res.status(400).json({
        status: "error",
        message: "Bad Request: bookId required",
      });
    }
    //get list of reviews
    const reviewsOfBook = await getActiveReviewsByBookIdModel(bookId);
    return res.status(200).json({
      status: "success",
      message: "Reviews for items Found",
      data: reviewsOfBook,
    });
  } catch (error) {
    next(error);
  }
};
//////////////////////////////Member
export const createReviewController = async (req, res, next) => {
  try {
    //get logged User
    const userId = req.userInfo?._id;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorised: User needs to log in",
      });
    }

    //Get borrowId
    const { borrowId } = req.params;
    if (!borrowId) {
      return res.status(400).json({
        status: "error",
        message: "Bad request: borrowId not found",
      });
    }

    //Get other attributes
    const { rating, title, comment } = req.body;

    //1. Find borrow record
    const borrow = await getBorrowByIdModel(borrowId);
    if (!borrow) {
      return res.status(404).json({
        status: "error",
        message: "Not Found: Borrow record not found",
      });
    }

    //2. Check If borrowRecord belong to user authenticated
    if (String(borrow.userId) !== String(userId)) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden: Current user cannot Review the item",
      });
    }
    //3. Check if borrow status ==="returned"
    if (borrow.status !== "returned") {
      return res.status(400).json({
        status: "error",
        message: "Item not available for review",
      });
    }

    //4. Ensure not existing reviews for the borrow
    //check in borrowTable
    if (borrow.reviewId) {
      return res.status(400).json({
        status: "error",
        message: "A review for this borrow already exists",
      });
    }
    // check in reviewTable
    // const existingReview = await getReviewByBorrowModel(borrowId);
    // if (existingReview) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "A review for this borrow already exists",
    //   });
    // }

    //5.Create review-> update Review Entity
    const review = await createReviewModel({
      rating,
      title,
      comment,
      borrowId: borrow._id,
      bookId: borrow.bookId,
      userId,
      status: "inactive",
    });

    //6.Update Borrow Entity-> add: reviewId, status -> "reviewed"
    const updatedBorrow = await updateBorrowHistoryModel(borrow._id, {
      reviewId: review._id,
      status: "reviewed",
    });

    return res.status(201).json({
      status: "success",
      message: "Review created successfully",
      data: {
        review,
        borrow: updatedBorrow,
      },
    });
  } catch (error) {
    next(error);
  }
};

//to display in "My Reviews" -> only active Reviews
export const getMyReviewsController = async (req, res, next) => {
  try {
    const userId = req.userInfo?._id;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: Needs to log in",
      });
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit || "10", 10));
    const skip = (page - 1) * limit;

    const { items, total } = await getActiveReviewsByUserIdModel(userId, {
      skip,
      limit,
    });

    const pages = Math.max(1, Math.ceil(total / limit));

    return res.status(200).json({
      status: "success",
      message: "User reviews retrieved successfully",
      data: {
        items,
        pagination: { total, page, limit, pages },
        params: { page, limit, sortBy: "createdAt", sortOrder: "desc" },
      },
    });
  } catch (error) {
    next(error);
  }
};

////////////////////////////////////Admin
//can filter reviews by bookId, userId, status or all -> filter ={}
export const getAllReviewsController = async (req, res, next) => {
  try {
    const { bookId, userId, status } = req.query;
    const filter = {};

    //add values in query to the filter
    if (bookId) filter.bookId = bookId;
    if (userId) filter.userId = userId;
    if (status) filter.status = status;

    //get all reviews with the filter
    const allReviews = await getAllReviewsModel(filter);

    return res.status(200).json({
      status: "success",
      message: "All reviews retrieved successfully",
      data: allReviews,
    });
  } catch (error) {
    next(error);
  }
};

//Update by admin -> make it active
export const updateReviewController = async (req, res, next) => {
  try {
    //1. Get reviewIdfrom params
    const { reviewId } = req.params;
    if (!reviewId) {
      return res.status(500).json({
        status: "error",
        message: "ReviewId is required",
      });
    }
    // const reviewObj = await getReviewById;

    //2. Get status from body (otherwise new status=active)
    const { status = "active" } = req.body;
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status. Allowed: 'active' or 'inactive'",
      });
    }

    //3. Update reviewEntity by reviewId
    const updatedReview = await updateReviewModel(reviewId, { status });
    if (!updatedReview) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    //4. response to front-end
    return res.status(200).json({
      status: "success",
      message: `Review updated successfully (status: ${status})`,
      data: updatedReview,
    });
  } catch (error) {
    next(error);
  }
};

//Update by admin -> delete?
