import express from "express";

const router = express.Router();

router.get("/librarians", getAllLibrariansController);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware

router.post("/create-librarian", createLibrarianController);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware, createLibrarianValidator (Joi)

router.delete("/delete-librarian/:librarianId", deleteLibrarianController);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware

router.patch("/update-librarian/:librarianId", updateLibrarianController);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware, updateLibrarianValidator (Joi)

export default router;
