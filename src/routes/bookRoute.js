import express from "express";
import {
  addBookController,
  deleteBookController,
  getActiveBookByIdController,
  getAllBooksController,
  getAllPublicBooksController,
  getBookByIdController,
  searchAllBooksController,
  searchPublicBooksController,
  updateBookController,
} from "../controllers/bookController.js";

// Auth middlewares
import { auth, isActiveUser, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/addbook", auth, isAdmin, isActiveUser, addBookController);
// -> add authMiddleware, isAdminMiddleware, addBookValidator (Joi)

// search/get Public books -> used
router.get("/searchbooks", searchPublicBooksController);
// no validator

// search/get AllBooks(admin) -> used
router.get(
  "/searchallbooks",
  auth,
  isAdmin,
  isActiveUser,
  searchAllBooksController
);
// -> add authMiddleware, isAdminMiddleware

//--> not used
//router.get("/books", getAllPublicBooksController);
// no validator

// ->not used
//router.get("/allbooks", auth, isAdmin, isActiveUser, getAllBooksController);
// -> add authMiddleware, isAdminMiddleware

// active book only ->any
router.get("/books/:bookId", getActiveBookByIdController);

//active or inactive book -> admin
router.get(
  "/allbooks/:bookId",
  auth,
  isAdmin,
  isActiveUser,
  getBookByIdController
);
// -> Auth middleware, isAdmin

router.patch(
  "/updatebook/:bookId",
  auth,
  isAdmin,
  isActiveUser,
  updateBookController
);
// -> add authMiddleware, isAdminMiddleware, updateBookValidator (Joi)

router.delete(
  "/deletebook/:bookId",
  auth,
  isAdmin,
  isActiveUser,
  deleteBookController
);
// -> add authMiddleware, isAdminMiddleware

export default router;
