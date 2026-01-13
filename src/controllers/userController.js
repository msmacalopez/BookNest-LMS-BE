import { hashPassword } from "../utils/bcrypt.js";
import {
  getAllUsersModel,
  getUserByIdModel,
  createUserModel,
  deleteUserModel,
  updateUserModel,
} from "../models/User/UserModel.js";
import { hashPassword } from "../utils/bcrypt.js";

/////////////////////////// Member functions controller - MEMBER
// create new user (member)
export const createNewMemberController = async (req, res, next) => {
  try {
    // create member
    const userObj = { ...req.body, role: "member" };

    // hash password before saving to DB
    userObj.password = hashPassword(req.body.password);

    // save to DB
    const newUser = await createUserModel(userObj);

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      // data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

//get details fo user by id (from token)
export const getMyDetailsController = async (req, res, next) => {
  try {
    // req.user is set in auth middleware
    const userId = req.user._id;
    const userDetails = await getUserByIdModel(userId);
    res.status(200).json({
      status: "success",
      message: "User details found successfully",
      data: userDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyDetailsController = (req, res) => {
  try {
  } catch (error) {}
};

//////////////// Controller functions for admin - ADMIN / LIBRARIAN

export const getAllUsersController = (req, res) => {
  try {
  } catch (error) {}
};

export const getUserByIdController = (req, res) => {
  try {
  } catch (error) {}
};

// can create only members
export const createUserController = (req, res) => {
  try {
  } catch (error) {}
};

// can update (make a member active/inactive)
export const updateUserController = (req, res) => {
  try {
  } catch (error) {}
};

////////////////// Controller functions - SUPER ADMIN

// Get librarian (filter by id+librarian)
export const getLibrarianByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const librarianFound = await getAllUsersModel({
      _id: id,
      role: "librarian",
    });

    // if librarian is not found
    if (!librarian) {
      return res.status(404).json({
        status: "error",
        message: "Librarian not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Librarian found successfully",
      data: librarianFound,
    });
  } catch (error) {
    next(error);
  }
};

// Get all librarians (filter by role=librarian)
export const getAllLibrariansController = async (req, res, next) => {
  try {
    const librarians = await getAllUsersModel({ role: "librarian" });

    res.status(200).json({
      status: "success",
      message: "Librarians found successfully",
      data: librarians,
    });
  } catch (error) {
    next(error);
  }
};

// Create librarian????????? password???
export const createLibrarianController = async (req, res, next) => {
  try {
    // create librarian
    const librarianObj = {
      ...req.body,
      role: "admin",
    };
    const newLibrarian = await createUserModel(librarianObj);

    res.status(201).json({
      status: "success",
      message: "Librarian created successfully",
      // data: newLibrarian,
    });
  } catch (error) {
    next(error);
  }
};

//delete librarian by id
export const deleteLibrarianController = async (req, res, next) => {
  try {
    // get librarian id from req.params
    const { id } = req.params;
    const librarian = await deleteUserModel({ _id: id, role: "librarian" });

    // if librarian to delete is not found
    if (!librarian) {
      return res.status(404).json({
        status: "error",
        message: "Librarian not found or already deleted",
      });
    }
  } catch (error) {
    next(error);
  }
};

// Update librarian (filter by id): change info but role and password
export const updateLibrarianInfoController = async (req, res, next) => {
  try {
    const { id } = req.params;

    //remove password if present
    const updatedData = { ...req.body };
    delete updatedData.password;

    // update librarian in DB
    const updatedLibrarian = await updateUserModel(
      { _id: id, role: "librarian" },
      updatedData
    );

    res.status(200).json({
      status: "success",
      message: "Librarian updated successfully",
      data: updatedLibrarian,
    });
  } catch (error) {
    next(error);
  }
};

// Update Librarian by id: only change role
export const upgradeUserToLibrarianController = async (req, res, next) => {
  const userId = req.params.id;
  const newRole = "librarian";
  const userUpgraded = await getAllUsersModel({ _id: userId, role: newRole });

  res.status(200).json({
    status: "success",
    message: "User upgraded to librarian successfully",
    data: userUpgraded,
  });
  try {
  } catch (error) {
    next(error);
  }
};
