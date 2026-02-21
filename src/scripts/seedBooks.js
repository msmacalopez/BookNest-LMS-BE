import "dotenv/config";
import mongoose from "mongoose";
import Book from "../models/Book/BookSchema.js";

import { bookList } from "./listOfBook.js";

const MONGO_URI = process.env.MONGO_URL;

if (!MONGO_URI) {
  console.error("Missing Mongo URI");
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    await Book.deleteMany({});
    console.log("Old books deleted");

    await Book.insertMany(bookList);
    console.log("Books seeded successfully");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();

// RUN in comm line:
//npm run seed:books
