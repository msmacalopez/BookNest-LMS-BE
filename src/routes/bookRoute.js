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

const router = express.Router();

router.post("/addbook", addBookController);
// -> add authMiddleware, isAdminMiddleware, addBookValidator (Joi)

// ?????? -> used
router.get("/searchbooks", searchPublicBooksController);
// no validator

// ?????? -> used
router.get("/searchallbooks", searchAllBooksController);
// -> add authMiddleware, isAdminMiddleware

//--> not used
router.get("/books", getAllPublicBooksController);
// no validator

// ->not used
router.get("/allbooks", getAllBooksController);
// -> add authMiddleware, isAdminMiddleware

// active book only ->any
router.get("/books/:bookId", getActiveBookByIdController);

//active or inactive book -> admin
router.get("/allbooks/:bookId", getBookByIdController);
// -> Auth middleware, isAdmin

router.patch("/updatebook/:bookId", updateBookController);
// -> add authMiddleware, isAdminMiddleware, updateBookValidator (Joi)

router.delete("/deletebook/:bookId", deleteBookController);
// -> add authMiddleware, isAdminMiddleware

export default router;
