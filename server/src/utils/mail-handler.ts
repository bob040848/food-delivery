//server/src/utils/mail-handler.ts
import { configDotenv } from "dotenv";
import { createTransport } from "nodemailer";
configDotenv();

const { EMAIL_PASS, EMAIL_USER } = process.env;

const transport = createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendUserVerificationLink = async (
  baseURL: string,
  email: string
) => {
  await transport.sendMail({
    subject: "Account Verification Link",
    to: email,
    from: EMAIL_USER,
    html: `
    <div> 
        <h1>Account Verification Link</h1>
        <p style="color:red;">This verification link is valid for 1 hour</p>
        <p>Please click the button below to verify your account:</p>
        <a href="${baseURL}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Account</a>            
    </div>`,
  });
};

export const sendPasswordResetLink = async (baseURL: string, email: string) => {
  await transport.sendMail({
    subject: "Password Reset Request",
    to: email,
    from: EMAIL_USER,
    html: `
    <div> 
        <h1>Password Reset Request</h1>
        <p style="color:red;">This reset link is valid for 1 hour</p>
        <p>Please click the button below to reset your password:</p>
        <a href="${baseURL}" style="display: inline-block; background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
    </div>`,
  });
};
