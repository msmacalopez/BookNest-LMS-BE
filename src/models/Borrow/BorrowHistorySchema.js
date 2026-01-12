import mongoose from "mongoose";

const BorrowHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["borrowed", "returned", "overdue", "reviewed"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    bookTitle: {
      type: String,
      required: true,
    },
    typeEdition: {
      type: String,
      required: true,
      enum: ["Hardcover", "Paperback", "Ebook", "Audiobook"],
    },
    coverImageUrl: {
      type: String,
    },
    borrowDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
      default: "",
    },
    returnDate: {
      type: Date,
      default: "",
    },
  },
  { timestamps: true }
);
