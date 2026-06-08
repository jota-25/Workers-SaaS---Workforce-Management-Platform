import crypto from "crypto";



export const hashToken = (token) => {
  return crypto
    .createHash("sha256")  // algoritmo SHA-256
    .update(token)          // el token a hashear
    .digest("hex");         // resultado en formato hexadecimal
};