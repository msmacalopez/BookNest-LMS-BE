import express from "express";
import { auth, isActiveUser, isAdmin } from "../middlewares/authMiddleware.js";

import {
  createHoldController,
  getMyHoldsController,
  cancelMyHoldController,
  getAllHoldsController,
  fulfillHoldToBorrowController,
} from "../controllers/holdController.js";

const router = express.Router();

// member places hold (physical only)
router.post("/:bookId", auth, isActiveUser, createHoldController);

// member sees own holds
router.get("/myholds", auth, isActiveUser, getMyHoldsController);

// member cancels own hold
router.patch("/cancel/:holdId", auth, isActiveUser, cancelMyHoldController);

// admin lists all holds
router.get("/allholds", auth, isAdmin, isActiveUser, getAllHoldsController);

// admin fulfills a hold -> creates borrow
router.post(
  "/fulfill/:holdId",
  auth,
  isAdmin,
  isActiveUser,
  fulfillHoldToBorrowController
);

export default router;
