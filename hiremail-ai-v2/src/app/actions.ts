"use server";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { createSession, deleteSession, requireUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { setUserFields } from "@/services/user.repository";
import { syncUser, reanalyzeUserEmails } from "@/services/sync.service";
import { addFeedback } from "@/services/email.repository";
import { CATEGORIES } from "@/ai/types";
import { FIELD_KEYS } from "@/config/fields";
export async function registerAction(formData: FormData) {

    const email = String(formData.get("email") || "").trim().toLowerCase(),
        password = String(formData.get("password") || ""),
        name = String(formData.get("name") || "").trim();

    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || name.length < 2)
        redirect("/register?error=invalid");

    const id = crypto.randomUUID();
    try {
        await query("INSERT INTO users(id,email,password_hash,display_name) VALUES($1,$2,$3,$4)",
            [id, email, hashPassword(password), name]);
        await query("INSERT INTO user_fields(user_id,field_key) VALUES($1,'ALL')", [id]);
    } catch {
        redirect("/register?error=exists");
    }
    await createSession(id); redirect("/");
}
export async function loginAction(formData: FormData) { const email = String(formData.get("email") || "").trim().toLowerCase(), password = String(formData.get("password") || ""); const r = await query<{ id: string; password_hash: string }>("SELECT id,password_hash FROM users WHERE email=$1", [email]); const u = r.rows[0]; if (!u || !verifyPassword(password, u.password_hash)) redirect("/login?error=invalid"); await createSession(u.id); redirect("/"); }
export async function logoutAction() { await deleteSession(); redirect("/login"); }
export async function saveFieldsAction(formData: FormData) { const u = await requireUser(); const all = formData.get("ALL") === "on"; const fields = all ? ["ALL"] : FIELD_KEYS.filter(k => formData.get(k) === "on"); await setUserFields(u.id, fields.length ? fields : ["ALL"]); await reanalyzeUserEmails(u.id); redirect("/settings?saved=1"); }
export async function syncNowAction() { const u = await requireUser(); await syncUser(u.id); redirect("/?synced=1"); }
export async function feedbackAction(formData: FormData) { const u = await requireUser(); const emailId = String(formData.get("emailId") || ""), isRelevant = formData.get("isRelevant") === "true", category = String(formData.get("category") || "NOT_RELEVANT"), field = String(formData.get("field") || "GENERAL"); if (!CATEGORIES.includes(category as any)) throw new Error("Invalid category"); await addFeedback(u.id, emailId, isRelevant, category, field); redirect(`/emails/${emailId}?saved=1`); }

export async function disconnectGmailAction() { const u = await requireUser(); await query("DELETE FROM gmail_connections WHERE user_id=$1", [u.id]); redirect("/settings?gmail=disconnected"); }
