import { sign, verify } from "jsonwebtoken";

const SECRETKEY = "my_secret";

export const generateNewToken = (payload: object) => {
  return sign(payload, SECRETKEY, { expiresIn: "1h" });
};

export const verifyToken = (token: string) => {
  return verify(token, SECRETKEY);
};
