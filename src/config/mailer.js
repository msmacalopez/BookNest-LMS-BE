import nodemailer from "nodemailer";
import config from "./config.js";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 30000,
  family: 4,
});

transporter.verify((error, success) => {
  if (error) {
    console.error("[MAILER] Transporter verify failed:", error?.message);
    console.error("[MAILER] Full error:", error);
  } else {
    console.log("[MAILER] Mail server is ready");
  }
});
