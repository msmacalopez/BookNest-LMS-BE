import express from "express";
import cors from "cors";
import { connectMongoDB } from "./src/config/mongoDB.js";
import config from "./src/config/config.js";

// Importing Routes
import authRoute from "./src/routes/authRoute.js";
import memberRoute from "./src/routes/memberRoute.js";
import adminRoute from "./src/routes/adminRoute.js";
import superAdminRoute from "./src/routes/superAdminRoute.js";
import bookRoute from "./src/routes/bookRoute.js";
import borrowsRoute from "./src/routes/borrowsRoute.js";
import reviewRoute from "./src/routes/reviewRoute.js";

//auto Return Job
import { startAutoReturnEbooksJob } from "./src/jobs/autoReturnEbooks.js";

// Create an Express application - server instance
const app = express();
const PORT = config.port;

//GLOBAL MIDDLEWARE
app.use(express.json()); // Middleware to parse JSON bodies into req.body
app.use(cors()); // Middleware to enable CORS

//ROUTES
// Server is Live
app.get("/", (req, res) => {
  res.send("Server is live!");
});

// Authentication Routes
app.use("/api/v1/auth", authRoute);

//Member Routes
app.use("/api/v1/member", memberRoute);

//Admin Routes
app.use("/api/v1/admin", adminRoute);

//Super Admin Routes
app.use("/api/v1/superadmin", superAdminRoute);

//Book Routes
app.use("/api/v1/books", bookRoute);

//Borrows Routes
app.use("/api/v1/borrows", borrowsRoute);

//Review Routes
app.use("/api/v1/reviews", reviewRoute);

// error validator
app.use((error, req, res, next) => {
  console.log("Error Validator:", error);

  res.status(error.status || 500);
  return res.json({
    status: "error",
    message: error.message,
  });
});

// Start the server is MongoDB is connected
connectMongoDB()
  .then((data) => {
    console.log("Mongo DB is connected");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });

//// after mongoose connects -> RUN AUTORETURN JOB
startAutoReturnEbooksJob();
