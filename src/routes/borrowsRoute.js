import express from "express";
import {
  createBorrowController,
  createBorrowForUserController,
} from "../controllers/borrowsController.js";

const router = express.Router();

//by umember -> only E-books
router.post("/:bookId", createBorrowController);
// -> add authMiddleware, createBorrowValidator (Joi)

//by admin -> any book
router.post("/:userId/:bookId", createBorrowForUserController);
//> add AuthMiddleware, isAdmin, createBorrowValidator(Joi),

router.get("/myborrows", getMyBorrowsController);
// -> add authMiddleware

router.get("/allborrows", getAllBorrowsController);
// -> add authMiddleware, isAdminMiddleware

router.patch("/returnbook/:borrowId", returnBookController);
// -> add authMiddleware, isAdminMiddleware

export default router;
