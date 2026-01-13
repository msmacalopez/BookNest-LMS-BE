import { getUserByEmailModel } from "../models/User/UserModel.js";
import { verifyAccessToken, verifyRenewToken } from "../utils/jwt.js";

export const auth = async (req, res, next) => {
  try {
    //1. receive token from headers
    //2. verify if sessionToken is valid
    //3. if valid, get user details (email) from decoded-token
    //4. get user information from DB using email
    //5. attach user information to req object (req.userInfo) and then next();

    const { authorization } = req.headers;

    const decoded = verifyAccessToken(authorization);

    if (decoded?.email) {
      const tokenObj = authorization;

      const user = await getUserByEmailModel(decoded.email);

      // not even keep the hashed-password in req object
      user.password = "";
      user.userInfo = user;
      return next();
    } else {
      const error = {
        message: "Invalid Token" + decoded,
        status: 401, //not authenticated
      };
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

export const renewAuth = async (req, res, next) => {
  try {
    //     1. receive jwt via authorization header
    const { authorization } = req.headers;

    // 2. verify if jwt is valid(no expired, secretkey) by decoding jwt
    const decoded = verifyRenewToken(authorization);

    if (decoded?.email) {
      // 3. If valid decoded-token, get token object
      const tokenObj = authorization;

      if (true) {
        // 4. Extract email from the decoded jwt obj
        // 5. Get user by email
        const user = await getUserByEmail(decoded.email);

        if (user?._id) {
          // 6. If user exist, they are now authorized

          //not even keep the hashed password in the req object
          user.password = "";
          req.userInfo = user;

          return next();
        }
      }
    }

    // if token is expired or not valid
    const error = {
      message: decoded,
      status: 401, // not authenticated
    };
    next(error);
  } catch (error) {
    next(error);
  }
};

export const isAdmin = (req, res, next) => {
  req.userInfo.role === "admin"
    ? next()
    : next({
        status: 403,
        message: "Unauthorized",
      });
};

export const isSuperAdmin = (req, res, next) => {
  req.userInfo.role === "superadmin"
    ? next()
    : next({
        status: 403,
        message: "Unauthorized",
      });
};

// Example
// req.headers = {
//     host: "...",
//     connection: "...",
//     authorization: "Bearer ey123abc...",   <-- THIS
//     user-agent: "...",
//     accept: "...",
//     ...
//   }
