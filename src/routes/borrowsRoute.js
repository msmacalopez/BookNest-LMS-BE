import express from "express";

const router = express.Router();

router.post("/:bookId", createBorrowController);
// -> add authMiddleware, createBorrowValidator (Joi)

router.get("/myborrows", getMyBorrowsController);
// -> add authMiddleware

router.get("/allborrows", getAllBorrowsController);
// -> add authMiddleware, isAdminMiddleware

router.patch("/returnbook/:borrowId", returnBookController);
// -> add authMiddleware, isAdminMiddleware

export default router;
