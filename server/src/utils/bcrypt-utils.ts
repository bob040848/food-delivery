import { hashSync, compareSync } from "bcryptjs";
export const encryptHash = (password: string) => {
  return hashSync(password, 10);
};

export const decryptHash = (hash: string, password: string) => {
  return compareSync(hash, password);
};
