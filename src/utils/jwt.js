import JWT from "jsonwebtoken";
import config from "../config/config.js";

//create access jwt token
export const createAccessToken = (payload) => {
  const token = JWT.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expires,
  });
  return token;
};

//verify access jwt token
export const verifyAccessToken = (token) => {
  try {
    const decoded = JWT.verify(token, config.jwt.secret);
    return decoded;
  } catch (error) {
    // throw new Error("Invalid or expired token");
    return error.message === "jwt expired"
      ? "jwt expired" + error.message
      : "Invalid Token";
  }
};

//create renew jwt token
export const createRenewToken = ({ email }) => {
  const renewToken = JWT.sign({ email }, config.renewJwt.secret, {
    expiresIn: config.renewJwt.expires,
  });
  return renewToken;
};

//verify renew jwt token
export const verifyRenewToken = (renewToken) => {
  try {
    const decoded = JWT.verify(renewToken, config.renewJwt.secret);
    return decoded;
  } catch (error) {
    // throw new Error("Invalid or expired renew token");
    return error.message === "jwt expired"
      ? "jwt Renew expired"
      : "Invalid Renew Token";
  }
};
