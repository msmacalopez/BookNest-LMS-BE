import express from "express";

const router = express.Router();

// api/v1/member/register
router.post("/register", createNewUserController);
//-> add newUserValidator (Joi)

// api/v1/member/user
router.get("/mydetails", getMyDetailsController);
//-> add authMiddleware

// api/v1/member/update-mydetails
router.patch("/update-mydetails", updateMyDetailsController);
//-> add authMiddleware + updateMyDetailsValidator (Joi)

export default router;
