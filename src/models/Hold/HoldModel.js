import HoldSchema from "./HoldSchema.js";

export const createHoldModel = (obj) => HoldSchema(obj).save();

export const findActiveHoldByUserAndBookModel = (userId, bookId) => {
  return HoldSchema.findOne({ userId, bookId, status: "active" });
};

export const getExpiredActiveHoldsModel = () => {
  return HoldSchema.find({
    status: "active",
    expiresAt: { $lte: new Date() },
  });
};

export const expireHoldModel = (holdId) => {
  return HoldSchema.findOneAndUpdate(
    { _id: holdId, status: "active" },
    { status: "expired" },
    { new: true }
  );
};

// User cancel their woen hold -> if active
export const cancelHoldModel = (holdId, userId) => {
  return HoldSchema.findOneAndUpdate(
    { _id: holdId, userId, status: "active" },
    { status: "cancelled" },
    { new: true }
  );
};

export const fulfillHoldModel = (holdId, adminId, adminEmail, borrowId) => {
  return HoldSchema.findOneAndUpdate(
    { _id: holdId, status: "active" },
    {
      status: "fulfilled",
      borrowId,
      fulfilledById: adminId,
      fulfilledByEmail: adminEmail,
      fulfilledAt: new Date(),
    },
    { new: true }
  );
};

export const getMyHoldsModel = async (userId, { skip, limit }) => {
  const [items, total] = await Promise.all([
    HoldSchema.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("bookId", "title author isbn typeEdition coverImageUrl status"),
    HoldSchema.countDocuments({ userId }),
  ]);
  return { items, total };
};

export const getAllHoldsModel = async (
  filter = {},
  { skip = 0, limit = 10 }
) => {
  const [items, total] = await Promise.all([
    HoldSchema.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fName lName email status role")
      .populate("bookId", "title author isbn typeEdition coverImageUrl status"),
    HoldSchema.countDocuments(filter),
  ]);
  return { items, total };
};

export const countActiveHoldsByUserModel = (userId) => {
  return HoldSchema.countDocuments({ userId, status: "active" });
};
