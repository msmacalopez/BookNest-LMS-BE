import express from "express";

const router = express.Router();

router.post("/addbook", addBookController);
// -> add authMiddleware, isAdminMiddleware, addBookValidator (Joi)

// ??????
router.post("/searchbooks", searchPublicBooksController);
// no validator

// ??????
router.post("/searchallbooks", searchAllBooksController);
// -> add authMiddleware, isAdminMiddleware

router.get("/books", getAllPublicBooksController);
// no validator

router.get("/allbooks", getAllBooksController);
// -> add authMiddleware, isAdminMiddleware

router.get("/books/:id", getBookByIdController);
// -> add authMiddleware

router.patch("/updatebook/:id", updateBookController);
// -> add authMiddleware, isAdminMiddleware, updateBookValidator (Joi)

router.delete("/deletebook/:id", deleteBookController);
// -> add authMiddleware, isAdminMiddleware

export default router;
