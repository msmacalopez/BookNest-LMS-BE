import express from "express";

// controllers
import {
  createLibrarianController,
  deleteLibrarianController,
  downToMemberController,
  getAllLibrariansController,
  updateLibrarianInfoController,
  upgradeUserToLibrarianController,
  superadminListUsersController,
  superadminGetUserByIdController,
  superadminCreateUserController,
  superadminUpdateUserController,
  superadminDeleteUserController,
  superadminBulkDeleteUsersController,
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
  createUserBySuperAdminValidation,
  updateUserBySuperAdminValidation,
  bulkDeleteUsersValidation,
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
  auth,
  isAdmin,
  isSuperAdmin,
  isActiveUser,
  newAdminValidation,
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

  auth,
  isAdmin,
  isSuperAdmin,
  isActiveUser,
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
  isActiveUser,
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
  isActiveUser,
  downToMemberValidation,
  downToMemberController
);
//-> add authMiddleware, isAdminMiddleware, isSuperAdminMiddleware, updateLibrarianValidator (Joi)

router.get(
  "/users",
  auth,
  isAdmin,
  isSuperAdmin,
  isActiveUser,
  superadminListUsersController
);

router.get(
  "/users/:id",
  auth,
  isAdmin,
  isSuperAdmin,
  isActiveUser,
  superadminGetUserByIdController
);

router.post(
  "/users",
  auth,
  isAdmin,
  isSuperAdmin,
  isActiveUser,
  createUserBySuperAdminValidation,
  superadminCreateUserController
);

router.patch(
  "/users/:id",
  auth,
  isAdmin,
  isSuperAdmin,
  isActiveUser,
  updateUserBySuperAdminValidation,
  superadminUpdateUserController
);

router.delete(
  "/users/:id",
  auth,
  isAdmin,
  isSuperAdmin,
  isActiveUser,
  superadminDeleteUserController
);

router.delete(
  "/users/bulk",
  auth,
  isAdmin,
  isSuperAdmin,
  isActiveUser,
  bulkDeleteUsersValidation,
  superadminBulkDeleteUsersController
);
export default router;
