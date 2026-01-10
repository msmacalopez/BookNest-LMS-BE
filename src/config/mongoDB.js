import mongoose from "mongoose";
import config from "./config.js";

export const connectMongoDB = () => {
  return mongoose.connect(config.mongo.url);
};
