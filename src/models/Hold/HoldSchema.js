import mongoose from "mongoose";

const HoldSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["active", "fulfilled", "expired", "cancelled"],
      default: "active",
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },

    //get details from other Schemas
    bookTitle: { type: String, required: true },
    bookAuthor: { type: String, required: true },
    bookIsbn: { type: String, required: true },
    typeEdition: { type: String, required: true },
    memberEmail: { type: String, required: true },
    coverImageUrl: { type: String, default: "" },

    holdDate: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },

    // when admin fulfills
    fulfilledById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fulfilledByEmail: { type: String, default: "" },
    fulfilledAt: { type: Date },
    borrowId: { type: mongoose.Schema.Types.ObjectId, ref: "Borrow" },
  },
  { timestamps: true }
);

// prevent duplicate active hold for same user + same book
HoldSchema.index(
  { userId: 1, bookId: 1, status: 1 },
  { name: "uniq_active_hold_guard" }
);

export default mongoose.model("Hold", HoldSchema);
