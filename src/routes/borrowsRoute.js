import express from "express";
import {
  adminReturnBookController,
  createMyBorrowController,
  createBorrowForUserController,
  getAllBorrowsController,
  getMyBorrowsController,
} from "../controllers/borrowsController.js";

//Auth middlewares
import { auth, isActiveUser, isAdmin } from "../middlewares/authMiddleware.js";
// Joi validation middleware
import {
  adminReturnBorrow,
  createAnyBorrow,
} from "../middlewares/joiValidation.js";

const router = express.Router();

//by member -> only E-books
router.post(
  "/:bookId",
  auth,
  isActiveUser,
  createAnyBorrow,
  createMyBorrowController
);
// -> add authMiddleware, createBorrowValidator (Joi)

//by admin -> any book
router.post(
  "/:userId/:bookId",
  auth,
  isAdmin,
  isActiveUser,
  createAnyBorrow,
  createBorrowForUserController
);
//> add AuthMiddleware, isAdmin, createBorrowValidator(Joi),

router.get("/myborrows", auth, getMyBorrowsController);
// -> add authMiddleware

router.get("/allborrows", auth, isAdmin, isActiveUser, getAllBorrowsController);
// -> add authMiddleware, isAdminMiddleware

router.patch(
  "/returnbook/:borrowId",
  auth,
  isAdmin,
  isActiveUser,
  adminReturnBorrow,
  adminReturnBookController
);
// -> add authMiddleware, isAdminMiddleware

export default router;
