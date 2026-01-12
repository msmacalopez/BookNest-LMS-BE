import express from "express";

const router = express.Router();

router.post("/:borrowId", createReviewController);
// -> add authMiddleware, createReviewValidator (Joi)

router.get("/book/:bookId", getReviewsByBookController);
// -> add authMiddleware??? anyone can see reviews?

router.get("/user/:userId", getReviewsByUserController);
// -> add authMiddleware, isAdminMiddleware

router.get("/allreviews", getAllReviewsController);
// -> add authMiddleware, isAdminMiddleware

// admin can approve or reject reviews
router.patch("/updatereview/:reviewId", updateReviewController);
// -> add authMiddleware, isAdmin, updateReviewValidator (Joi)

export default router;
