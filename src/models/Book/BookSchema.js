import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
      index: 1,
    },
    description: {
      type: String,
      required: true,
    },
    publicationYear: {
      type: Number,
      required: true,
      min: 1000,
      max: new Date().getFullYear(),
    },
    genre: {
      type: String,
      required: true,
      enum: [
        "Fiction",
        "Non-Fiction",
        "Science Fiction",
        "Fantasy",
        "Mystery",
        "Biography",
        "History",
        "Children's",
        "Romance",
        "Horror",
      ],
    },
    typeEdition: {
      type: String,
      required: true,
      enum: ["Hardcover", "Paperback", "Ebook", "Audiobook"],
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      required: true,
    },
    publisher: {
      type: String,
      required: true,
    },
    pages: {
      type: Number,
      required: true,
      min: 1,
    },
    country: {
      type: String,
      required: true,
    },
    coverImageUrl: {
      type: String,
      required: false,
      default: "https://pixabay.com/vectors/image-pictures-icon-photo-1271454/",
    },
    // counterReviews: {
    //   type: Number,
    //   default: 0,
    // },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);
