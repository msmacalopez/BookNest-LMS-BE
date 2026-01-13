import { getUserByEmailModel } from "../models/User/UserModel.js";
import { verifyAccessToken, verifyRenewToken } from "../utils/jwt.js";

export const auth = async (req, res, next) => {};

export const renewAuth = async (req, res, next) => {};

export const isAdmin = (req, res, next) => {};

export const isSuperAdmin = (req, res, next) => {};
