import bcrypt from "bcrypt";
const SALT_ROUNDS = 10;

export const hashPassword = (plainPass) => {
  return bcrypt.hashSync(plainPass, SALT_ROUNDS);
};

export const comparePassword = (plainPass, hashedPass) => {
  return bcrypt.compareSync(plainPass, hashedPass);
};
