import Joi from "joi";

const STR = Joi.string();
const STR_REQUIRED = Joi.string().required();
const EMAIL = STR.email({ minDomainSegments: 2 });
const EMAIL_REQ = STR_REQUIRED.email({ minDomainSegments: 2 });
const ISTRUE = Joi.boolean();
const NUM_REQ = Joi.number();

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
