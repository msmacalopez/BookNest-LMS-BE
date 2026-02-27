import mongoose from "mongoose";

const BorrowHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["borrowed", "returned", "overdue", "reviewed"],
      default: "borrowed",
    },
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      // not required to create a BorrowObject
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
    },
    bookAuthor: { type: String, required: true },
    bookIsbn: { type: String, required: true },
    memberEmail: { type: String, required: true },
    borrowDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
      // default: "",
    },
    returnDate: {
      type: Date,
      // default: "",
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    returnedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdByEmail: { type: String, required: true },
    returnedByEmail: { type: String, default: "" },
  },
  { timestamps: true }
);
export default mongoose.model("Borrow", BorrowHistorySchema);
