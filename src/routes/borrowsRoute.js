//borrowsRoute.js
import express from "express";
import {
  adminReturnBookController,
  createMyBorrowController,
  createBorrowForUserController,
  createBorrowByQueryController,
  getAllBorrowsController,
  getMyBorrowsController,
} from "../controllers/borrowsController.js";

//Auth middlewares
import { auth, isActiveUser, isAdmin } from "../middlewares/authMiddleware.js";
// Joi validation middleware
import {
  adminReturnBorrow,
  createAnyBorrow,
  createBorrowByQueryValidation,
} from "../middlewares/joiValidation.js";

const router = express.Router();

router.post(
  "/admin/manual",
  auth,
  isAdmin,
  isActiveUser,
  createBorrowByQueryValidation,
  createBorrowByQueryController
);

//by admin -> any book
//> add AuthMiddleware, isAdmin, createBorrowValidator(Joi),
router.post(
  "/:userId/:bookId",
  auth,
  isAdmin,
  isActiveUser,
  createAnyBorrow,
  createBorrowForUserController
);

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

//by member -> only E-books
router.post(
  "/:bookId",
  auth,
  isActiveUser,
  createAnyBorrow,
  createMyBorrowController
);
// -> add authMiddleware, createBorrowValidator (Joi)

export default router;
