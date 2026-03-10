BookNest LMS - Backend

BookNest is a full-stack Library Management System developed to streamline and modernise the running of a library. The site enables members to browse and borrow books online, place holds on physical titles, and provide reviews. Library staff have complete control over books, members, borrow records, holds, and reviews. A Super Admin level manages all staff accounts and oversees the overall operation of the system.

Features

Book Catalogue & Search
Search all books on-site in real time using title, author, or keywords. Users can filter by genre, type of edition, and language.

Borrow E-books
Members can self-borrow e-book editions directly. Each member can borrow up to five e-books simultaneously. E-books are automatically returned by the system on the due date.

Hold System
Unavailable physical books can be placed on hold. Holds last for two days and are fulfilled by library staff. Members can have a maximum of three active holds.

Reviews and Ratings
Members can review and rate books after returning them. Reviews require admin approval before becoming publicly visible.

Admin Dashboard
Library staff manage books, issue physical books to members, process returns, fulfil holds, and moderate reviews.

Member Management
Admins can view and update the status of member accounts, including Active, Inactive, or Suspended.

Super Admin Controls
The Super Admin can add, upgrade, downgrade, and delete librarian accounts, providing complete control over user management.

Automated Background Jobs
Node-cron automatically processes expired e-book loans and unfulfilled holds every night at 3:00 AM without manual intervention.

Technologies Used
Frontend

React 19 + Vite
Modern frontend framework with hot module replacement.

Redux Toolkit
Global state management for authentication and user data.

React Router DOM v7
Client-side navigation and routing.

Tailwind CSS + DaisyUI
Utility-based responsive styling with ready-made UI components.

Axios
HTTP client for API communication.

React Toastify
User-friendly toast notification system.

Backend

Express + Node.js
RESTful API server with asynchronous request handling and error management.

MongoDB + Mongoose
NoSQL database with schema validation and atomic document operations.

JWT (jsonwebtoken)
Dual-token authentication system with short-lived access tokens and long-lived refresh tokens.

bcrypt
Password hashing using 10 salt rounds.

Joi
Request body validation through middleware.

node-cron
Scheduled background tasks for automated system maintenance.

Multer
Middleware for uploading book cover images.

Nodemailer
Email notification support.

Deployment

Vercel
Frontend deployment using a global CDN.

Render
Backend hosting and environment variable management.

MongoDB Atlas
Cloud-hosted database service.

Getting Started
Prerequisites

Node.js (v18 or higher)
npm
MongoDB Atlas account
Git

Installation
Clone the repositories
git clone https://github.com/msmacalopez/BookNest-LMS-FE.git
git clone https://github.com/msmacalopez/BookNest-LMS-BE.git
Backend Setup
cd BookNest-LMS-BE
npm install

Create a .env file in the backend root directory:

PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES=15m
JWT_RENEW_SECRET=your_renew_secret
JWT_RENEW_EXPIRES=7d

Start the backend server:

npm run dev

The server will run at:

http://localhost:5000
Frontend Setup
cd BookNest-LMS-FE
npm install

Create a .env file in the frontend root directory:

VITE_API_BASE_URL=http://localhost:5000

Start the frontend:

npm run dev

Open your browser and navigate to:

http://localhost:5173
Seed Demo Data
npm run seed:books
Folder Structure
Backend
/src
controllers - Routing logic
middleware - Authentication, role, and validation middleware
models - Mongoose models (User, Book, BorrowHistory, Hold, Review)
routes - Express route definitions
jobs - Background node-cron jobs
validators - Joi validation schemas
Frontend
/src
components - Reusable UI components
pages - Application pages and views
store - Redux Toolkit slices and store
services - Axios API service operations
assets - Static files and images
User Roles

Member
Browse books, borrow e-books, place holds, and leave reviews.

Admin / Librarian
Manage books, borrows, holds, members, and reviews.

Super Admin
Full administrative control including staff account management.

Deployment

The system is fully deployed and available online.

Frontend:
https://booknest-lms.vercel.app/

Backend API:
Private

To deploy your own instance, push the backend to Render and the frontend to Vercel. Ensure that all environment variables are configured in the respective deployment dashboards before deployment.

Creators

Victoria University Sydney Campus
NIT3004 – IT Capstone Project II

Macarena Lopez
Sanjil Shrestha
