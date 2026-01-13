import { getUserByEmailModel } from "../models/User/UserModel.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { createAccessToken, createRenewToken } from "../utils/jwt.js";

// Controller functions for user authentication and management

export const loginUserController = async (req, res, next) => {
  try {
    //get email from request body
    const { email, password } = req.body;
    const user = await getUserByEmailModel(email);

    if (user) {
      //compare password
      if (comparePassword(password, user.password)) {
        const payload = { email }; //or user.email

        //generate Access Token
        const accessToken = createAccessToken(payload);

        // generate Renew Token
        const renewToken = createRenewToken(payload);

        //send response
        return res.json({
          status: "success",
          message: "User Authenticated",
          tokens: {
            accessToken,
            renewToken,
          },
        });
      } else {
        const error = {
          message: "Invalid Credentials",
        };
        next(error);
      }
    } else {
      const error = {
        message: "User not found",
      };
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

export const logoutUserController = (req, res, next) => {
  try {
  } catch (error) {}
};

export const renewTokenController = (req, res, next) => {
  try {
    const payload = { email: req.userInfo.email };

    //generate Access Token
    const accessToken = createAccessToken(payload);

    // send response
    return res.json({
      status: "success",
      message: "Token Renewed",
      tokens: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// EXAMPLE
// req.user = {
//   _id: "f91a23f1...",
//   email: "test@gmail.com",
//   role: "admin",
//   iat: 1736765432,
//   exp: 1736851832,
// };
