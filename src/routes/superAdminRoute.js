import express from "express";

// controllers
import {
  createLibrarianController,
  deleteLibrarianController,
  downToMemberController,
  getAllLibrariansController,
  updateLibrarianInfoController,
  upgradeUserToLibrarianController,
} from "../controllers/userController.js";

//auth middlewares
import { auth, isAdmin, isSuperAdmin } from "../middlewares/authMiddleware.js";
// joi middlewares
import {
  downToMemberValidation,
  newAdminValidation,
  promoteToLibrarianValidation,
  updateLibrarianValidation,
} from "../middlewares/joiValidation.js";

const router = express.Router();

router.get(
  "/librarians",
  auth,
  isAdmin,
  isSuperAdmin,
  getAllLibrariansController
);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware

router.post(
  "/create-librarian",
  auth,
  isAdmin,
  isSuperAdmin,
  newAdminValidation,
  createLibrarianController
);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware, createLibrarianValidator (Joi)

router.delete(
  "/delete-librarian/:librarianId",
  auth,
  isAdmin,
  isSuperAdmin,
  deleteLibrarianController
);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware

router.patch(
  "/update-librarian/:librarianId",
  auth,
  isAdmin,
  isSuperAdmin,
  updateLibrarianValidation,
  updateLibrarianInfoController
);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware, updateLibrarianValidator (Joi)

//promote member to librarian
router.patch(
  "/upgrade-librarian/:librarianId",
  auth,
  isAdmin,
  isSuperAdmin,
  promoteToLibrarianValidation,
  upgradeUserToLibrarianController
);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware, updateLibrarianValidator (Joi)

//pdowngrade librarian to member
router.patch(
  "/down-librarian/:librarianId",
  auth,
  isAdmin,
  isSuperAdmin,
  downToMemberValidation,
  downToMemberController
);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware, updateLibrarianValidator (Joi)

export default router;
