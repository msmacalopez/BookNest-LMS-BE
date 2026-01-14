import express from "express";

//controllers
import {
  loginUserController,
  renewTokenController,
} from "../controllers/authController.js";
//auth middlewares
import { renewAuth } from "../middlewares/authMiddleware.js";
//joi middlewares
import { loginValidation } from "../middlewares/joiValidation.js";

const router = express.Router();

// api/v1/auth/login
router.post("/login", loginValidation, loginUserController);
//-> add loginUserValidator (Joi)

// api/v1/auth/logout
// router.post("/logout", logoutUserController);
//-> add authMiddleware

// api/v1/auth/renew-jwt
router.get("/renew-jwt", renewAuth, renewTokenController);
//-> add authMiddleware

export default router;
