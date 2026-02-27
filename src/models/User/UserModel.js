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

//// Get user by ID but include password
export const getUserByIdWithPasswordModel = (userId) => {
  return UserSchema.findOne({ _id: userId });
};

// when udating password:
export const updatePasswordByUserIdModel = (userId, hashedPassword) => {
  return UserSchema.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        password: hashedPassword,
        refreshJWT: "",
      },
    },
    { new: true, select: "-password" }
  );
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

// Get members with pagination + filter
export const getMembersPagedModel = async (
  filter = {},
  { skip = 0, limit = 10 } = {}
) => {
  const [items, total] = await Promise.all([
    UserSchema.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    UserSchema.countDocuments(filter),
  ]);

  return { items, total };
};
// Paged users (superadmin)
export const getUsersPagedModel = async (
  filter = {},
  { skip = 0, limit = 10 } = {}
) => {
  const [items, total] = await Promise.all([
    UserSchema.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    UserSchema.countDocuments(filter),
  ]);

  return { items, total };
};

export const deleteUsersByIdsModel = (ids = []) => {
  return UserSchema.deleteMany({ _id: { $in: ids } });
};
