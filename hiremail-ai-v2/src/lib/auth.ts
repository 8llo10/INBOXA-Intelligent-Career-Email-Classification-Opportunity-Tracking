import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "./db";
import { randomToken, sha256 } from "./crypto";

export type CurrentUser = { id: string; email: string; display_name: string; locale: string };
const cookieName = () => process.env.SESSION_COOKIE_NAME || "hiremail_session";

export async function createSession(userId: string) {
  const token = randomToken();
  const days = Number(process.env.SESSION_DAYS || "30");
  const expires = new Date(Date.now() + days * 86400000);
  await query("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,$3)", [sha256(token), userId, expires]);
  const jar = await cookies();
  jar.set(cookieName(), token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires });
}
export async function deleteSession() {
  const jar = await cookies(); const token = jar.get(cookieName())?.value;
  if (token) await query("DELETE FROM sessions WHERE token_hash=$1", [sha256(token)]);
  jar.delete(cookieName());
}
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const jar = await cookies(); const token = jar.get(cookieName())?.value;
  if (!token) return null;
  const r = await query<CurrentUser>(`SELECT u.id,u.email,u.display_name,u.locale FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>NOW()`, [sha256(token)]);
  return r.rows[0] || null;
}
export async function requireUser(): Promise<CurrentUser> { const u = await getCurrentUser(); if (!u) redirect("/login"); return u as CurrentUser; }
export async function requireApiUser(): Promise<CurrentUser> { const u = await getCurrentUser(); if (!u) throw new Error("UNAUTHORIZED"); return u; }
