import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
      index: 1,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: 1,
    },
    title: {
      type: String,
      required: true,
      index: 1,
    },
    comment: {
      type: String,
      default: "",
      index: 1,
    },
    borrowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Borrow",
      required: true,
      unique: true, //one review per borrow
      index: 1,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: 1,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: 1,
      // Not unique, same user in multiple reviews
    },
    //for admin search/table
    bookTitle: { type: String, required: true, index: 1 },
    bookAuthor: { type: String, required: true, index: 1 },
    bookIsbn: { type: String, required: true, index: 1 },
    memberEmail: { type: String, required: true, index: 1 },

    // for table display
    borrowDate: { type: Date },
    returnDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
