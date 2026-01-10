import express from "express";

const router = express.Router();

router.get("/users", getAllUsersController);
//-> add authMiddleware, isAdminMiddleware

router.get("/user/:id", getUserByIdController);
// -> add authMiddleware, isAdminMiddleware

router.post("/create-user", createUserController);
//-> add authMiddleware, isAdminMiddleware, createUserValidator (Joi)

router.patch("/update-user/:id", updateUserController);
//-> add authMiddleware, isAdminMiddleware, updateUserValidator (Joi)

export default router;
