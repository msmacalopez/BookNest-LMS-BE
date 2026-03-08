import express from "express";
import { auth, isAdmin, isActiveUser } from "../middlewares/authMiddleware.js";
//Admin dashboard
import {
  getDashboardBorrowStatsController,
  getBorrowingTrendsController,
  getCategoryDistributionController,
  getLanguageDistributionController,
  getTypeEditionDistributionController,
} from "../controllers/statsController.js";
//Members dashboard
import {
  getMemberDashboardStatsController,
  getMemberBorrowingTrendsController,
  getMemberGenreDistributionController,
  getMemberRecommendationsController,
} from "../controllers/memberStatsController.js";
// import {
//   getMemberBorrowingTrendsController,
//   getMemberGenreDistributionController,
// } from "../controllers/memberChartsController.js";
// import { getMemberRecommendationsController } from "../controllers/memberRecommendationsController.js";

const router = express.Router();

//ADMIN DASHBOARD
router.get(
  "/figures",
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

// MEMBER DASHBOARD
router.get(
  "/member/dashboard",
  auth,
  isActiveUser,
  getMemberDashboardStatsController
);

router.get(
  "/member/charts/borrowing-trends",
  auth,
  isActiveUser,
  getMemberBorrowingTrendsController
);

router.get(
  "/member/charts/genre-distribution",
  auth,
  isActiveUser,
  getMemberGenreDistributionController
);

router.get(
  "/member/recommendations",
  auth,
  isActiveUser,
  getMemberRecommendationsController
);

export default router;
