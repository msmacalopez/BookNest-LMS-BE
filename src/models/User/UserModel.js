import UserModel from "./UserSchema/js";

/////////////////Auth Controller
// For Login User
export const getUserByEmailModel = (email) => {
  return UserModel.findOne({ email: email });
};

///////////////// Member Controller
// Create new user
export const createNewUserModel = (userObj) => {
  return UserModel(userObj).save();
};

// Get my details
export const getMyDetailsModel = (userId) => {
  return UserModel.findOne({ _id: userId });
};

// Update my details
export const updateMyDetailsModel = (userId, updatedObj) => {
  return UserModel.findOneAndUpdate(userId, updatedObj).select("-password");
};

///////////////// Admin Controller

// Get user by ID
export const getUserByIdModel = (userId) => {
  return UserModel.findOne({ _id: userId }).select("-password");
};

// Get all users -> filter can be empty
export const getAllUsersModel = (filter) => {
  return UserModel.find(filter).select("-password");
};

// Create user
export const createUserModel = (userObj) => {
  return UserModel(userObj).save();
};
// Update user
export const updateUserModel = (filter, updatedObj) => {
  return UserModel.findOneAndUpdate(filter, updatedObj).select("-password");
};

/////////////////// Super admin

// Delete librarian (use Id or email)
export const deleteUserModel = (filter) => {
  return UserModel.findOneAndDelete(filter);
};
