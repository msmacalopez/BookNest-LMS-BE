# dependencies

yarn add: express cors dotenv mongoose bcrypt joi jsonwebtoken multer

# notes

1.0. no user can make borrows if they have an overdue book in their list.
->correct createBorrowController,createBorrowForUserController

1.1. make createBorrowController,createBorrowForUserController
-->make sure, user cannot book the same bookId if that bookId is already in my borrows list, and with status "borrowed" or "overdue"

2. in borrowsRoute, user can only book if Ebook. and return by system. otherwise Admin has to do it.

//debugging
// export const createNewMemberController = async (req, res, next) => {
// try {
// const existingUser = await getUserByEmailModel(
// req.body.email.toLowerCase()
// );

// if (existingUser) {
// return res.status(400).json({
// status: "error",
// message: "This email is already registered",
// });
// }

// const userObj = {
// ...req.body,
// email: req.body.email.toLowerCase(),
// role: "member",
// status: "pending",
// isEmailVerified: false,
// };

// userObj.password = hashPassword(req.body.password);

// const newUser = await createUserModel(userObj);

// try {
// await sendVerificationEmail(newUser);
// } catch (emailError) {
// console.error("[REGISTER] User created but email failed:", emailError);
// return res.status(201).json({
// status: "success",
// message:
// "Account created, but verification email could not be sent right now. Please try resend verification later.",
// });
// }

// return res.status(201).json({
// status: "success",
// message:
// "Registration successful. Please check your email to verify your account.",
// });
// } catch (error) {
// next(error);
// }
// };
//nodemailer-resend
// export const createNewMemberController = async (req, res, next) => {
// try {
// const existingUser = await getUserByEmailModel(
// req.body.email.toLowerCase()
// );

// if (existingUser) {
// return res.status(400).json({
// status: "error",
// message: "This email is already registered",
// });
// }

// const userObj = {
// ...req.body,
// email: req.body.email.toLowerCase(),
// role: "member",
// status: "pending",
// isEmailVerified: false,
// };

// userObj.password = hashPassword(req.body.password);

// const newUser = await createUserModel(userObj);

// await sendVerificationEmail(newUser);

// return res.status(201).json({
// status: "success",
// message:
// "Registration successful. Please check your email to verify your account.",
// });
// } catch (error) {
// next(error);
// }
// };
// original version
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
