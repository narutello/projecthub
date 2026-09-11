import { createHmac, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { env, isWorkspacePreview } from "./env.server";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

const COOKIE = "ph_admin_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function previewFallbackEmail() {
  return "admin@projecthub.app";
}

function previewFallbackPassword() {
  return "hub-admin-2026";
}

function adminEmail(): string {
  return env("ADMIN_EMAIL") ?? previewFallbackEmail();
}

function adminPassword(): string {
  return env("ADMIN_PASSWORD") ?? previewFallbackPassword();
}

function sessionSecret(): Uint8Array {
  const explicit = env("ADMIN_SESSION_SECRET");
  const material = explicit ?? `project-hub:${adminEmail()}:${adminPassword()}`;
  const digest = createHmac("sha256", "project-hub.admin").update(material).digest();
  return new Uint8Array(digest);
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

export type AdminSession = {
  email: string;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = getCookie(COOKIE);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), {
      algorithms: ["HS256"],
    });
    const email = typeof payload.sub === "string" ? payload.sub : null;
    if (!email) return null;
    return { email };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function loginAdmin(email: string, password: string): Promise<AdminSession> {
  const expectedEmail = adminEmail();
  const expectedPassword = adminPassword();
  const emailOk = safeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase());
  const passwordOk = safeEqual(password, expectedPassword);
  if (!emailOk || !passwordOk) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(expectedEmail)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(sessionSecret());

  setCookie(COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
  });

  return { email: expectedEmail };
}

export function logoutAdmin(): void {
  deleteCookie(COOKIE, { path: "/" });
}

export function loginMeta() {
  return { preview: isWorkspacePreview() };
}
