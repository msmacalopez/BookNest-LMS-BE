import express from "express";
import { auth, isAdmin, isActiveUser } from "../middlewares/authMiddleware.js";
import {
  getDashboardBorrowStatsController,
  getBorrowingTrendsController,
  getCategoryDistributionController,
  getLanguageDistributionController,
  getTypeEditionDistributionController,
} from "../controllers/statsController.js";

const router = express.Router();

router.get(
  "/dashboard/borrows",
  auth,
  isAdmin,
  isActiveUser,
  getDashboardBorrowStatsController
);

router.get(
  "/charts/borrowing-trends",
  auth,
  isAdmin,
  isActiveUser,
  getBorrowingTrendsController
);

router.get(
  "/charts/category-distribution",
  auth,
  isAdmin,
  isActiveUser,
  getCategoryDistributionController
);

router.get(
  "/charts/language-distribution",
  auth,
  isAdmin,
  isActiveUser,
  getLanguageDistributionController
);

router.get(
  "/charts/type-edition-distribution",
  auth,
  isAdmin,
  isActiveUser,
  getTypeEditionDistributionController
);

export default router;
