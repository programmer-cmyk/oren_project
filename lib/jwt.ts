import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "change-me-dev")

export type JWTPayload = {
  sub: string
  email: string
  name: string
}

export async function signSession(payload: JWTPayload) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret)
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify<JWTPayload>(token, secret)
  return payload
}
