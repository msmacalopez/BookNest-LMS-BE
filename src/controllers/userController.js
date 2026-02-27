import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import {
  getAllUsersModel,
  getUserByIdModel,
  createUserModel,
  deleteUserModel,
  updateUserModel,
  getUserByIdWithPasswordModel,
  updatePasswordByUserIdModel,
  getMembersPagedModel,
  getUsersPagedModel,
  deleteUsersByIdsModel,
} from "../models/User/UserModel.js";
import UserSchema from "../models/User/UserSchema.js";

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

//get details of user by id (from token)
export const getMyDetailsController = async (req, res, next) => {
  try {
    // req.userInfo is set in auth middleware
    // const userId = req.userInfo._id;

    //details already from auth middleware:
    const userDetails = req.userInfo;
    // const userDetails = await getUserByIdModel(userId);
    console.log(userDetails);
    //send data to frontend
    res.status(200).json({
      status: "success",
      message: "User details found successfully",
      user: userDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyDetailsController = async (req, res, next) => {
  try {
    // req.userInfo is set in auth middleware
    const userId = req.userInfo._id;
    const updatedObj = { ...req.body };
    updatedObj.role = req.userInfo.role; // prevent role update

    //password will be updated in email
    // delete updatedObj.password;

    // if password is to be updated, hash it
    if (updatedObj?.password) {
      updatedObj.password = hashPassword(updatedObj.password);
    }
    const updatedUser = await updateUserModel({ _id: userId }, updatedObj);

    // respond to frontend
    return res.status(200).json({
      status: "success",
      message: "Your details have been updated",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

//to update password
export const changeMyPasswordController = async (req, res, next) => {
  try {
    const userId = req.userInfo._id;
    const { currentPassword, newPassword } = req.body;

    const user = await getUserByIdWithPasswordModel(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const isMatch = comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    //block using same password
    const sameAsOld = comparePassword(newPassword, user.password);
    if (sameAsOld) {
      return res.status(400).json({
        status: "error",
        message: "New password must be different from current password",
      });
    }

    const hashed = hashPassword(newPassword);

    await updatePasswordByUserIdModel(userId, hashed);

    return res.status(200).json({
      status: "success",
      message: "Password updated successfully. Please log in again.",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMyAccountController = async (req, res, next) => {
  try {
    const userId = req.userInfo._id; // comes from auth middleware

    const deletedUser = await deleteUserModel({ _id: userId });

    if (!deletedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // if deletion is successful
    return res.status(200).json({
      status: "success",
      message: "Your account has been deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

//////////////// Controller functions for admin - ADMIN / LIBRARIAN

export const getAllMembersController = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const status = (req.query.status || "").trim();

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit || "10", 10));
    const skip = (page - 1) * limit;

    // Base filter: only members
    const filter = { role: "member" };

    // status filter (active/inactive/suspended/deactivated)
    if (status) filter.status = status;

    // q search
    if (q) {
      const rx = new RegExp(q, "i");

      filter.$or = [
        { fName: rx },
        { lName: rx },
        { email: rx },
        { phone: rx },
        { address: rx },
        { role: rx }, // will match "member" anyway
        { status: rx },
      ];

      // search by ObjectId string
      if (/^[0-9a-fA-F]{24}$/.test(q)) {
        filter.$or.push({ _id: q });
      }
    }

    const { items, total } = await getMembersPagedModel(filter, {
      skip,
      limit,
    });
    const pages = Math.max(1, Math.ceil(total / limit));

    return res.status(200).json({
      status: "success",
      message: "Members retrieved successfully",
      data: {
        items,
        pagination: { total, page, limit, pages },
        params: { q, status, page, limit },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMemberByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    // find member with matching id
    const members = await getAllUsersModel({ _id: id, role: "member" });

    // getAllUsersModel returns an array, so check length or first element
    const member = members[0];

    if (!member) {
      return res.status(404).json({
        status: "error",
        message: "Member not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Member found successfully",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// can update (make a member active/inactive)
export const updateMemberController = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Clone data to safely modify
    const updatedData = { ...req.body };
    // Do not allow password updates
    delete updatedData.password;

    // Update only members
    const updatedMember = await updateUserModel(
      { _id: id, role: "member" },
      updatedData
    );

    if (!updatedMember) {
      return res.status(404).json({
        status: "error",
        message: "Member not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    next(error);
  }
};

// can create only members????? how to set password
// export const createUserController = (req, res) => {
//   try {
//   } catch (error) {}
// };

////////////////// Controller functions - SUPER ADMIN

// Get librarian (filter by id+librarian)
export const getLibrarianByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const librarianFound = await getAllUsersModel({
      _id: id,
      role: "admin",
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
    const librarians = await getAllUsersModel({ role: "admin" });

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
    const hashedPassword = hashPassword(req.body.password);
    // create librarian
    const librarianObj = {
      ...req.body,
      password: hashedPassword,
      role: "admin",
    };
    const newLibrarian = await createUserModel(librarianObj);
    // remove hashed-pass
    newLibrarian.password = "";

    res.status(201).json({
      status: "success",
      message: "Librarian created successfully",
      data: newLibrarian,
    });
  } catch (error) {
    next(error);
  }
};

//delete librarian by id
export const deleteLibrarianController = async (req, res, next) => {
  try {
    // get librarian id from req.params
    const { librarianId } = req.params;
    const librarian = await deleteUserModel({
      _id: librarianId,
      role: "admin",
    });

    // if librarian to delete is not found
    if (!librarian) {
      return res.status(404).json({
        status: "error",
        message: "Librarian not found or already deleted",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Librarian deleted successfully",
      data: {
        _id: librarian._id,
        email: librarian.email,
        name: librarian.lName,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update librarian (filter by id): change info but role and password
export const updateLibrarianInfoController = async (req, res, next) => {
  try {
    const { librarianId } = req.params;

    //remove password if present
    const updatedData = { ...req.body };
    delete updatedData.password;

    // update librarian in DB
    const updatedLibrarian = await updateUserModel(
      { _id: librarianId, role: "admin" },
      updatedData
    );

    if (!updatedLibrarian) {
      return res.status(404).json({
        status: "error",
        message: "Librarian not found",
      });
    }

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
  const userId = req.params.librarianId;
  const updatedUser = await updateUserModel(
    { _id: userId, role: "member" }, // only upgrade members
    { role: "admin" }
  );

  if (!updatedUser) {
    return res.status(404).json({
      status: "error",
      message: "User not found or not a member",
    });
  }

  res.status(200).json({
    status: "success",
    message: "User upgraded to librarian successfully",
    data: updatedUser,
  });
  try {
  } catch (error) {
    next(error);
  }
};

// Downgrade Librarian by id: only change role
export const downToMemberController = async (req, res, next) => {
  const userId = req.params.librarianId;
  const updatedUser = await updateUserModel(
    { _id: userId, role: "admin" }, // only downgrade admins
    { role: "member" }
  );

  if (!updatedUser) {
    return res.status(404).json({
      status: "error",
      message: "User not found or not an admin",
    });
  }

  res.status(200).json({
    status: "success",
    message: "User is now a member",
    data: updatedUser,
  });
  try {
  } catch (error) {
    next(error);
  }
};

//super admin more
export const superadminListUsersController = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const status = (req.query.status || "").trim();
    const role = (req.query.role || "").trim(); // member/admin

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit || "10", 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;

    if (q) {
      const rx = new RegExp(q, "i");
      filter.$or = [
        { fName: rx },
        { lName: rx },
        { email: rx },
        { phone: rx },
        { address: rx },
        { role: rx },
        { status: rx },
      ];
      if (/^[0-9a-fA-F]{24}$/.test(q)) filter.$or.push({ _id: q });
    }

    const { items, total } = await getUsersPagedModel(filter, { skip, limit });
    const pages = Math.max(1, Math.ceil(total / limit));

    return res.status(200).json({
      status: "success",
      message: "Users retrieved successfully",
      data: {
        items,
        pagination: { total, page, limit, pages },
        params: { q, status, role, page, limit },
      },
    });
  } catch (e) {
    next(e);
  }
};

export const superadminGetUserByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    //prevent himself
    const requesterId = req.userInfo?._id;
    if (requesterId && String(requesterId) === String(id)) {
      return res.status(403).json({
        status: "error",
        message: "You cannot view your own account from this panel.",
      });
    }

    const user = await getUserByIdModel(id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }
    return res
      .status(200)
      .json({ status: "success", message: "User found", data: user });
  } catch (e) {
    next(e);
  }
};

export const superadminCreateUserController = async (req, res, next) => {
  try {
    const obj = { ...req.body };

    // hash password
    obj.password = hashPassword(obj.password);

    const created = await createUserModel(obj);
    created.password = ""; // never return password

    return res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: created,
    });
  } catch (e) {
    next(e);
  }
};

export const superadminUpdateUserController = async (req, res, next) => {
  try {
    const { id } = req.params;

    //prevent edit itself(not superadmin edition)
    const requesterId = req.userInfo?._id;
    if (requesterId && String(requesterId) === String(id)) {
      return res.status(403).json({
        status: "error",
        message: "You cannot edit your own account from this panel.",
      });
    }
    const obj = { ...req.body };

    //BLOCK password updates
    if ("password" in obj) delete obj.password;

    const updated = await updateUserModel({ _id: id }, obj);
    if (!updated) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: updated,
    });
  } catch (e) {
    next(e);
  }
};

export const superadminDeleteUserController = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid user id" });
    }

    // 1) Prevent deleting yourself
    const requesterId = req.userInfo?._id;
    if (requesterId && String(requesterId) === String(id)) {
      return res.status(403).json({
        status: "error",
        message: "You cannot delete your own account.",
      });
    }

    // 2) Prevent deleting any superadmin
    const targetUser = await getUserByIdModel(id); // returns user without password
    if (!targetUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (targetUser.role === "superadmin") {
      return res.status(403).json({
        status: "error",
        message: "Superadmin accounts cannot be deleted.",
      });
    }

    // 3) Safe to delete
    const deleted = await deleteUserModel({ _id: id });

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (e) {
    next(e);
  }
};

export const superadminBulkDeleteUsersController = async (req, res, next) => {
  try {
    const requesterId = req.userInfo?._id;
    const { ids = [] } = req.body || {};

    // remove self from deletion list
    const filteredIds = ids.filter((x) => String(x) !== String(requesterId));

    // remove any superadmin ids
    const superadmins = await UserSchema.find({
      _id: { $in: filteredIds },
      role: "superadmin",
    }).select("_id");

    const superadminIds = new Set(superadmins.map((u) => String(u._id)));
    const finalIds = filteredIds.filter((x) => !superadminIds.has(String(x)));

    if (!finalIds.length) {
      return res.status(400).json({
        status: "error",
        message: "No eligible users to delete (superadmin/self are protected).",
      });
    }

    const result = await deleteUsersByIdsModel(finalIds);

    return res.status(200).json({
      status: "success",
      message: `Deleted ${result?.deletedCount || 0} user(s)`,
      data: { deletedCount: result?.deletedCount || 0 },
    });
  } catch (e) {
    next(e);
  }
};
