import express from "express";
import {
  createReviewController,
  getAllReviewsController,
  getMyReviewsController,
  getReviewsByBookController,
  updateReviewController,
} from "../controllers/reviewController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:borrowId", auth, createReviewController);
// -> add authMiddleware, createReviewValidator (Joi)

router.get("/allreviews", auth, getAllReviewsController);
// -> add authMiddleware, isAdminMiddleware

// admin can approve or reject reviews
router.patch("/updatereview/:reviewId", auth, updateReviewController);
// -> add authMiddleware, isAdmin, updateReviewValidator (Joi)

// Get active reviews for a book (public)
router.get("/book/:bookId", getReviewsByBookController);

//active reviews
router.get("/myreviews", auth, getMyReviewsController);
// -> add authMiddleware

export default router;
