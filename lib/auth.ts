import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./db";
import type { User } from "@prisma/client";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const COOKIE_NAME = "signal_session";

export function signToken(userId: string) {
  return jwt.sign({ userId }, SECRET, { expiresIn: "30d" });
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

/** Server-only: reads the session cookie and loads the user. Returns null if not logged in. */
export async function getCurrentUser(): Promise<User | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET) as { userId: string };
    return await prisma.user.findUnique({ where: { id: payload.userId } });
  } catch {
    return null;
  }
}

/** Strips sensitive fields before sending a user object to the client. */
export function publicUser(u: User) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    premium: u.premium,
    createdAt: u.createdAt,
  };
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}
