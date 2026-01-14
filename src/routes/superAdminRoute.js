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
import {
  auth,
  isActiveUser,
  isAdmin,
  isSuperAdmin,
} from "../middlewares/authMiddleware.js";
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
  isActiveUser,
  getAllLibrariansController
);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware

router.post(
  "/create-librarian",
  newAdminValidation,
  auth,
  isAdmin,
  isSuperAdmin,
  isActiveUser,
  createLibrarianController
);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware, createLibrarianValidator (Joi)

router.delete(
  "/delete-librarian/:librarianId",
  auth,
  isAdmin,
  isSuperAdmin,
  isActiveUser,
  deleteLibrarianController
);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware

router.patch(
  "/update-librarian/:librarianId",
  updateLibrarianValidation,
  auth,
  isAdmin,
  isSuperAdmin,
  isActiveUser,
  updateLibrarianInfoController
);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware, updateLibrarianValidator (Joi)

//promote member to librarian
router.patch(
  "/upgrade-librarian/:librarianId",
  promoteToLibrarianValidation,
  auth,
  isAdmin,
  isSuperAdmin,
  isActiveUser,
  upgradeUserToLibrarianController
);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware, updateLibrarianValidator (Joi)

//pdowngrade librarian to member
router.patch(
  "/down-librarian/:librarianId",
  downToMemberValidation,
  auth,
  isAdmin,
  isSuperAdmin,
  isActiveUser,
  downToMemberController
);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware, updateLibrarianValidator (Joi)

export default router;
