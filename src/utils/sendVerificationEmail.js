import config from "../config/config.js";
import { createEmailVerifyToken } from "./jwt.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (user) => {
  try {
    const token = createEmailVerifyToken({
      email: user.email,
      type: "email-verification",
    });

    const verifyUrl = `${config.clientUrl}/verify-email?token=${token}`;

    console.log("[EMAIL] Sending verification email to:", user.email);
    console.log("[EMAIL] Verify URL:", verifyUrl);

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "BookNest <onboarding@resend.dev>",
      to: [user.email],
      subject: "Verify your BookNest account",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Welcome to BookNest</h2>
          <p>Hi ${user.fName},</p>
          <p>Please verify your email to activate your account.</p>
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

    if (error) {
      console.error("[EMAIL] Resend error:", error);
      throw new Error(error.message || "Failed to send email");
    }

    console.log("[EMAIL] Sent successfully:", data);
    return data;
  } catch (error) {
    console.error("[EMAIL] Failed to send verification email");
    console.error("[EMAIL] Error message:", error?.message);
    console.error("[EMAIL] Full error:", error);
    throw error;
  }
};
