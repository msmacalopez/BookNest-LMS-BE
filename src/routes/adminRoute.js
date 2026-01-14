import express from "express";
// controllers
import {
  getAllMembersController,
  getMemberByIdController,
  updateMemberController,
} from "../controllers/userController.js";
// auth middlewares
import { auth, isAdmin } from "../middlewares/authMiddleware.js";
//joi middlewares
import { updateMemberByAdminValidation } from "../middlewares/joiValidation.js";

const router = express.Router();

router.get("/users", auth, isAdmin, getAllMembersController);
//-> add authMiddleware, isAdminMiddleware

router.get("/users/:id", auth, isAdmin, getMemberByIdController);
// -> add authMiddleware, isAdminMiddleware

// router.post("/create-user", auth, isAdmin, createUserController);
//-> add authMiddleware, isAdminMiddleware, createUserValidator (Joi)

router.patch(
  "/update-user/:id",
  auth,
  updateMemberByAdminValidation,
  isAdmin,
  updateMemberController
);
//-> add authMiddleware, isAdminMiddleware, updateUserValidator (Joi)

export default router;
