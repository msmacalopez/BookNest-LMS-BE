import express from "express";
import { uploadBookCoverController } from "../controllers/uploadController.js";
import { uploadBookCover } from "../middlewares/multerUpload.js";
import { auth, isActiveUser, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/book-image",
  auth,
  isAdmin,
  isActiveUser,
  uploadBookCover,
  uploadBookCoverController
);

export default router;
