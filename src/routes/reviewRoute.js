import express from "express";
import {
  createReviewController,
  getAllReviewsController,
  getMyReviewsController,
  getReviewsByBookController,
  updateReviewController,
} from "../controllers/reviewController.js";

const router = express.Router();

// Get active reviews for a book (public)
router.get("/book/:bookId", getReviewsByBookController);

router.post("/:borrowId", createReviewController);
// -> add authMiddleware, createReviewValidator (Joi)

//active reviews
router.get("/myreviews", getMyReviewsController);
// -> add authMiddleware

router.get("/allreviews", getAllReviewsController);
// -> add authMiddleware, isAdminMiddleware

// admin can approve or reject reviews
router.patch("/updatereview/:reviewId", updateReviewController);
// -> add authMiddleware, isAdmin, updateReviewValidator (Joi)

export default router;
