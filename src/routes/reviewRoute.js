import express from "express";
import {
  createReviewController,
  getAllReviewsController,
  getMyReviewsController,
  getReviewsByBookController,
  updateReviewController,
} from "../controllers/reviewController.js";

//Auth middlewares
import { auth, isActiveUser, isAdmin } from "../middlewares/authMiddleware.js";

//Joi validation middleware
import {
  createAReview,
  updateReviewToActive,
} from "../middlewares/joiValidation.js";

const router = express.Router();

router.post(
  "/:borrowId",
  auth,
  isActiveUser,
  createAReview,
  createReviewController
);
// -> add authMiddleware, createReviewValidator (Joi)

router.get("/allreviews", auth, isAdmin, isActiveUser, getAllReviewsController);
// -> add authMiddleware, isAdminMiddleware

// admin can approve or reject reviews
router.patch(
  "/updatereview/:reviewId",
  auth,
  isAdmin,
  isActiveUser,
  updateReviewToActive,
  updateReviewController
);
// -> add authMiddleware, isAdmin, updateReviewValidator (Joi)

// Get active reviews for a book (public)
router.get("/book/:bookId", getReviewsByBookController);

//active reviews
router.get("/myreviews", auth, getMyReviewsController);
// -> add authMiddleware

export default router;
