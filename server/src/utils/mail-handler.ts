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
    subject: "User Verification Link",
    to: email,
    from: EMAIL_USER,
    html: `
    <div> 
        <h1>User Verification Link</h1>
        <p style="color:red;">This verification link is valid for 1 hour</p>
        <a href="${baseURL}">Verify</a>            
    </div>`,
  });
};
