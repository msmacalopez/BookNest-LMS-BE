import express from "express";
import {
  adminReturnBookController,
  createBorrowController,
  createBorrowForUserController,
  getAllBorrowsController,
  getMyBorrowsController,
} from "../controllers/borrowsController.js";

//Auth middlewares
import { auth, isActiveUser, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

//by member -> only E-books
router.post("/:bookId", auth, isActiveUser, createBorrowController);
// -> add authMiddleware, createBorrowValidator (Joi)

//by admin -> any book
router.post(
  "/:userId/:bookId",
  auth,
  isAdmin,
  isActiveUser,
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
  adminReturnBookController
);
// -> add authMiddleware, isAdminMiddleware

export default router;
