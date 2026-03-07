// dotenv is a Node.js package that lets you load environment variables from a .env file into process.env
import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  mongo: {
    url: process.env.MONGO_URL || "mongodb://localhost:27017/BookNest-DB",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "secret",
    expires: process.env.JWT_EXPIRES || "1m",
  },
  renewJwt: {
    secret: process.env.JWT_RENEW_SECRET || "renew-secret",
    expires: process.env.JWT_RENEW_EXPIRES || "1m",
  },
  emailVerifyJwt: {
    secret: process.env.EMAIL_VERIFY_SECRET || "email-verify-secret",
    expires: process.env.EMAIL_VERIFY_EXPIRES || "1d",
  },
  mail: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
  },
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

export default config;
