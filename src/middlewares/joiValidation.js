import Joi from "joi";

const STR = Joi.string();
const STR_REQUIRED = Joi.string().required();
const EMAIL = STR.email({ minDomainSegments: 2 });
const EMAIL_REQ = STR_REQUIRED.email({ minDomainSegments: 2 });
const ISTRUE = Joi.boolean();
const NUM = Joi.number();

const joiValidator = ({ req, res, next, schema }) => {
  try {
    const { error } = schema.validate(req.body || {});
    error
      ? res.json({
          status: "error",
          message: error.message,
        })
      : next();
  } catch (error) {
    next(error);
  }
};

////////////////////////by any member
export const loginValidation = (req, res, next) => {
  const schema = Joi.object({
    email: EMAIL_REQ,
    password: STR_REQUIRED,
  });
  return joiValidator({ req, res, next, schema });
};

export const newMemberValidation = (req, res, next) => {
  const schema = Joi.object({
    fName: STR_REQUIRED,
    lName: STR_REQUIRED,
    address: STR_REQUIRED,
    email: EMAIL_REQ,
    phone: STR_REQUIRED,
    password: STR_REQUIRED,
  });
  return joiValidator({ req, res, next, schema });
};

//Member cannot change role, status can only be change to deactivated
export const updateMyMemberValidation = (req, res, next) => {
  // Remove role if user tries to send it
  if ("role" in req.body) {
    delete req.body.role;
  }
  if ("status" in req.body && req.body.status !== "deactivated") {
    delete req.body.status;
  }
  const schema = Joi.object({
    fName: STR,
    lName: STR,
    address: STR,
    email: EMAIL,
    phone: STR,
    password: STR,
  });
  return joiValidator({ req, res, next, schema });
};

/////////////////////////////by admin
//only updates on status
export const updateMemberByAdminValidation = (req, res, next) => {
  const schema = Joi.object({
    status: STR.valid("active", "inactive", "suspended", "deactivated"),
  }).unknown(false); // <- reject any other fields

  return joiValidator({ req, res, next, schema });
};

//////////////////////////by super admin
//can give provisional pass
export const newAdminValidation = (req, res, next) => {
  const schema = Joi.object({
    fName: STR_REQUIRED,
    lName: STR_REQUIRED,
    email: EMAIL_REQ,
    phone: STR_REQUIRED,
    password: STR_REQUIRED,
    role: STR_REQUIRED.valid("admin"),
  });
  return joiValidator({ req, res, next, schema });
};

// update anything but pass
export const updateLibrarianValidation = (req, res, next) => {
  // Remove role if user tries to send it
  if ("password" in req.body) {
    delete req.body.password;
  }
  const schema = Joi.object({
    fName: STR,
    lName: STR,
    email: EMAIL,
    phone: STR,
    role: STR.valid("superadmin", "admin", "member"),
    status: STR.valid("active", "inactive", "suspended", "deactivated"),
  });
  return joiValidator({ req, res, next, schema });
};

// only role change
export const promoteToLibrarianValidation = (req, res, next) => {
  // Block unwanted fields
  if ("password" in req.body) delete req.body.password;
  if ("status" in req.body) delete req.body.status;
  if ("email" in req.body) delete req.body.email;
  if ("phone" in req.body) delete req.body.phone;
  if ("fName" in req.body) delete req.body.fName;
  if ("lName" in req.body) delete req.body.lName;

  const schema = Joi.object({
    role: Joi.string().valid("admin").required(), // only admin allowed
  });

  return joiValidator({ req, res, next, schema });
};

// only role change
export const downToMemberValidation = (req, res, next) => {
  // Block unwanted fields
  if ("password" in req.body) delete req.body.password;
  if ("status" in req.body) delete req.body.status;
  if ("email" in req.body) delete req.body.email;
  if ("phone" in req.body) delete req.body.phone;
  if ("fName" in req.body) delete req.body.fName;
  if ("lName" in req.body) delete req.body.lName;

  const schema = Joi.object({
    role: Joi.string().valid("member").required(),
  });

  return joiValidator({ req, res, next, schema });
};

///////////////////////////book validators
// create a book
export const addBook = (req, res, next) => {
  const currentYear = new Date().getFullYear();

  const schema = Joi.object({
    status: STR_REQUIRED.valid("active", "inactive"),
    title: STR_REQUIRED,
    author: STR_REQUIRED,
    isbn: STR_REQUIRED,
    description: STR_REQUIRED,
    publicationYear: NUM.integer().required().min(1000).max(currentYear),
    genre: STR_REQUIRED.valid(
      "Fiction",
      "Non-Fiction",
      "Science Fiction",
      "Fantasy",
      "Mystery",
      "Biography",
      "History",
      "Children's",
      "Romance",
      "Horror"
    ),
    typeEdition: STR_REQUIRED.valid(
      "Hardcover",
      "Paperback",
      "Ebook",
      "Audiobook"
    ),
    quantityTotal: NUM.integer().required().min(0),
    quantityAvailable: NUM.integer().min(0),
    isAvailable: ISTRUE,
    language: STR_REQUIRED,
    publisher: STR_REQUIRED,
    pages: NUM.integer().required().min(1),
    country: STR_REQUIRED,
    coverImageUrl: STR.uri().allow("", null).optional(), //valid url, can be empty
    averageRating: NUM.min(0).max(5),
    timesBorrowed: NUM.integer().min(0),
  });
  return joiValidator({ req, res, next, schema });
};

export const updateBook = (req, res, next) => {
  if ("isAvailable" in req.body) delete req.body.isAvailable;

  const currentYear = new Date().getFullYear();
  const schema = Joi.object({
    status: STR.valid("active", "inactive"),
    title: STR,
    author: STR,
    isbn: STR,
    description: STR,
    publicationYear: NUM.integer().min(1000).max(currentYear),
    genre: STR.valid(
      "Fiction",
      "Non-Fiction",
      "Science Fiction",
      "Fantasy",
      "Mystery",
      "Biography",
      "History",
      "Children's",
      "Romance",
      "Horror"
    ),
    typeEdition: STR.valid("Hardcover", "Paperback", "Ebook", "Audiobook"),
    quantityTotal: NUM.integer().min(0),
    language: STR,
    publisher: STR,
    pages: NUM.integer().min(1),
    country: STR,
    coverImageUrl: STR.uri().allow("na", "", null),
  }).unknown(false);

  return joiValidator({ req, res, next, schema });
};

/////////////////////borrow validators
// create a borrow by member (Ebook)
export const createAnyBorrow = (req, res, next) => {
  const schema = Joi.object({})
    .max(0) // body must be empty
    .unknown(false); // reject any unexpected fields

  return joiValidator({ req, res, next, schema });
};
export const adminReturnBorrow = (req, res, next) => {
  const schema = Joi.object({})
    .max(0) // body must be empty
    .unknown(false); // block any fields

  return joiValidator({ req, res, next, schema });
};

//////////////////////review validator
export const createAReview = (req, res, next) => {
  const schema = Joi.object({
    rating: NUM.integer().min(1).max(5).required(),

    title: STR_REQUIRED.trim().min(1).max(120),

    comment: STR.trim().max(2000).allow("", null).optional(),
  }).unknown(false); // block borrowId, userId, bookId, status

  return joiValidator({ req, res, next, schema });
};

export const updateReviewToActive = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string().valid("active", "inactive").required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details?.[0]?.message || "Invalid request",
    });
  }

  next();
};

export const changePasswordValidation = (req, res, next) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmNewPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({ "any.only": "Confirm password must match new password" }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details[0].message,
    });
  }
  next();
};

//superadmin
export const createUserBySuperAdminValidation = (req, res, next) => {
  const schema = Joi.object({
    role: Joi.string().valid("admin", "member").required(),
    status: Joi.string()
      .valid("active", "inactive", "suspended", "deactivated")
      .required(),

    fName: Joi.string().required(),
    lName: Joi.string().required(),
    address: Joi.string().required(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    phone: Joi.string().required(),
    password: Joi.string().min(6).required(),
  }).unknown(false);

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: "error", message: error.message });
  }
  next();
};

export const updateUserBySuperAdminValidation = (req, res, next) => {
  const schema = Joi.object({
    role: Joi.string().valid("admin", "member"),
    status: Joi.string().valid(
      "active",
      "inactive",
      "suspended",
      "deactivated"
    ),
    fName: Joi.string(),
    lName: Joi.string(),
    address: Joi.string(),
    email: Joi.string().email({ minDomainSegments: 2 }),
    phone: Joi.string(),
  }).unknown(false);

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: "error", message: error.message });
  }
  next();
};

export const bulkDeleteUsersValidation = (req, res, next) => {
  const schema = Joi.object({
    ids: Joi.array()
      .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
      .min(1)
      .required(),
  }).unknown(false);

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: "error", message: error.message });
  }
  next();
};
