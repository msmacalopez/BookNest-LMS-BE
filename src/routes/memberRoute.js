import express from "express";
//controllers
import {
  createNewMemberController,
  deleteMyAccountController,
  getMyDetailsController,
  updateMyDetailsController,
} from "../controllers/userController.js";
//auth middlewares
import { auth } from "../middlewares/authMiddleware.js";
//joi middlewares
import {
  newMemberValidation,
  updateMyMemberValidation,
} from "../middlewares/joiValidation.js";

const router = express.Router();

// api/v1/member/register
router.post("/register", newMemberValidation, createNewMemberController);
//-> add newUserValidator (Joi)

// api/v1/member/user
router.get("/mydetails", auth, getMyDetailsController);
//-> add authMiddleware

// api/v1/member/update-mydetails
router.patch(
  "/update-mydetails",
  auth,
  updateMyMemberValidation,
  updateMyDetailsController
);
//-> add authMiddleware + updateMyDetailsValidator (Joi)

router.delete("/delete-account", auth, deleteMyAccountController);
//-> add authMiddleware

export default router;
