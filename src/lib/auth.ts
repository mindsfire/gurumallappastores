import { SignJWT, jwtVerify } from "jose";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET_KEY || "fallback_super_secret_key_for_dev_only";
  return new TextEncoder().encode(secret);
};

export async function createSession(username: string) {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h") // 12 hours session
    .sign(getJwtSecretKey());

  return token;
}

export async function verifySession(token: string) {
  try {
    const verified = await jwtVerify(token, getJwtSecretKey());
    return verified.payload;
  } catch (err) {
    return null;
  }
}
