import UserSchema from "./UserSchema.js";

/////////////////Auth Controller
// For Login User
export const getUserByEmailModel = (email) => {
  return UserSchema.findOne({ email: email });
};

///////////////// User(any) Controller

// Get user by ID
export const getUserByIdModel = (userId) => {
  return UserSchema.findOne({ _id: userId }).select("-password");
};

// Get all users -> filter can be empty
export const getAllUsersModel = (filter) => {
  return UserSchema.find(filter).select("-password");
};

// Create user
export const createUserModel = (userObj) => {
  return UserSchema(userObj).save();
};
// Update user
export const updateUserModel = (filter, updatedObj) => {
  return UserSchema.findOneAndUpdate(
    filter,
    { $set: updatedObj }, // only update provided fields
    {
      new: true, // return updated document
      select: "-password", // never return password
    }
  );
};
// export const updateUserModel = (filter, updatedObj) => {
//   return UserSchema.findOneAndUpdate(filter, updatedObj).select("-password");
// };

// Delete librarian (use Id or email)
export const deleteUserModel = (filter) => {
  return UserSchema.findOneAndDelete(filter);
};
