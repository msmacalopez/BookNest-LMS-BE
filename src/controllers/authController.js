import { getUserByEmailModel } from "../models/User/UserModel.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { createAccessToken, createRenewToken } from "../utils/jwt.js";

// Controller functions for user authentication and management

export const loginUserController = async (req, res, next) => {
  try {
    //1. usuario existe? use email
    //2. if exist, then compare passwords
    //3. if password match, generate access token and renew token
    //4. send tokens to front end

    //get email from request body
    const { email, password } = req.body;

    // user found includes the hashed-password
    const user = await getUserByEmailModel(email);

    if (user) {
      //compare password
      if (comparePassword(password, user.password)) {
        const payload = { email }; //or user.email

        //generate Access Token
        const accessToken = createAccessToken(payload);

        // generate Renew Token
        const renewToken = createRenewToken(payload);

        //send response to front end
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
    //1. Get the email from userInfo, this comes from the authentication middleware (renewAuth)
    //2. because the renewToken is still valid (yes cause before we generate userInfo with that) then generate new access token
    //3. send tokens to front end
    const payload = { email: req.userInfo.email };

    //generate Access Token
    const accessToken = createAccessToken(payload);
    // only create accessJWT, does not create refreshJWT -> when this expire, user needs to login again

    // send response to front end
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
// req.userInfo = {
//   _id: "f91a23f1...",
//   email: "test@gmail.com",
//   role: "admin",
//   password: "",
//   phone: "1234567890",
// };
