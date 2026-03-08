import jwt from "jsonwebtoken";
import config from "../config/config.js";

//create access jwt token
export const createAccessToken = (payload) => {
  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expires,
  });
  return token;
};

//verify access jwt token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return error.message;
  }
};

//create renew jwt token
export const createRenewToken = ({ email }) => {
  const renewToken = jwt.sign({ email }, config.renewJwt.secret, {
    expiresIn: config.renewJwt.expires,
  });
  return renewToken;
};

//verify renew jwt token
export const verifyRenewToken = (renewToken) => {
  try {
    return jwt.verify(renewToken, config.renewJwt.secret);
  } catch (error) {
    return error.message;
  }
};

//nodemailer
export const createEmailVerifyToken = (payload) => {
  return jwt.sign(payload, config.emailVerifyJwt.secret, {
    expiresIn: config.emailVerifyJwt.expires,
  });
};

export const verifyEmailVerifyToken = (token) => {
  return jwt.verify(token, config.emailVerifyJwt.secret);
};
