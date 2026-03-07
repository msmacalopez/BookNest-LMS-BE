import nodemailer from "nodemailer";
import config from "./config.js";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("[MAILER] Transporter verify failed:", error?.message);
    console.error("[MAILER] Full error:", error);
  } else {
    console.log("[MAILER] Mail server is ready");
  }
});
