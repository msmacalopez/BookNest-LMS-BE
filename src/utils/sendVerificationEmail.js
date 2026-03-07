import config from "../config/config.js";
import { transporter } from "../config/mailer.js";
import { createEmailVerifyToken } from "./jwt.js";

export const sendVerificationEmail = async (user) => {
  const token = createEmailVerifyToken({
    email: user.email,
    type: "email-verification",
  });

  const verifyUrl = `${config.clientUrl}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: config.mail.from,
    to: user.email,
    subject: "Verify your BookNest account",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to BookNest</h2>
        <p>Hi ${user.fName},</p>
        <p>Thanks for signing up. Please verify your email to activate your account.</p>
        <p>
          <a 
            href="${verifyUrl}" 
            style="display:inline-block;padding:12px 20px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;"
          >
            Verify Email
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p>${verifyUrl}</p>
      </div>
    `,
  });
};
