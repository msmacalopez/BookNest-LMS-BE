import express from "express";
import {
  adminReturnBookController,
  createBorrowController,
  createBorrowForUserController,
  getAllBorrowsController,
  getMyBorrowsController,
} from "../controllers/borrowsController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

//by umember -> only E-books
router.post("/:bookId", auth, createBorrowController);
// -> add authMiddleware, createBorrowValidator (Joi)

//by admin -> any book
router.post("/:userId/:bookId", auth, createBorrowForUserController);
//> add AuthMiddleware, isAdmin, createBorrowValidator(Joi),

router.get("/myborrows", auth, getMyBorrowsController);
// -> add authMiddleware

router.get("/allborrows", auth, getAllBorrowsController);
// -> add authMiddleware, isAdminMiddleware

router.patch("/returnbook/:borrowId", auth, adminReturnBookController);
// -> add authMiddleware, isAdminMiddleware

export default router;
