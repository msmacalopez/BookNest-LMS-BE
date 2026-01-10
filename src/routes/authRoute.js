import express from "express";
import { createNewUserController } from "../controllers/authController.js";

const router = express.Router();

// api/v1/auth/register
router.post("/register", createNewUserController);
//-> add newUserValidator (Joi)

// api/v1/auth/login
router.post("/login", loginUserController);
//-> add loginUserValidator (Joi)

// api/v1/auth/logout
router.post("/logout", logoutUserController);
//-> add authMiddleware

// api/v1/auth/renew-jwt
router.get("/renew-jwt", renewTokenController);
//-> add authMiddleware

// api/v1/auth/user
router.get("/mydetails", getMyDetailsController);
//-> add authMiddleware

router.patch("/update-mydetails", updateMyDetailsController);
//-> add authMiddleware + updateMyDetailsValidator (Joi)

export default router;
