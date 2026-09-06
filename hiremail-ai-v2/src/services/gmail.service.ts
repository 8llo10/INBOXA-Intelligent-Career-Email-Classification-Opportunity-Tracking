import { google, gmail_v1 } from "googleapis";
import { decryptSecret } from "@/lib/crypto";
import { getGmailConnection } from "./user.repository";

export interface ParsedGmailMessage {
  gmailMessageId: string;
  gmailThreadId: string | null;
  senderName: string | null;
  senderEmail: string | null;
  subject: string;
  bodyText: string;
  snippet: string;
  receivedAt: Date;
}

function decode(value?: string | null) {
  if (!value) return "";
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function collectParts(part?: gmail_v1.Schema$MessagePart | null) {
  const out = { plain: [] as string[], html: [] as string[] };
  const walk = (node: gmail_v1.Schema$MessagePart) => {
    if (node.mimeType === "text/plain" && node.body?.data) out.plain.push(decode(node.body.data));
    if (node.mimeType === "text/html" && node.body?.data) out.html.push(stripHtml(decode(node.body.data)));
    for (const child of node.parts || []) walk(child);
  };
  if (part) walk(part);
  return out;
}

function header(message: gmail_v1.Schema$Message, name: string) {
  return message.payload?.headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";
}

function parseFrom(value: string) {
  const angle = value.match(/^(.*?)\s*<([^>]+)>$/);
  if (angle) return { name: angle[1].replace(/^"|"$/g, "").trim() || null, email: angle[2].trim().toLowerCase() };
  const bare = value.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0];
  return { name: bare ? value.replace(bare, "").trim() || null : value.trim() || null, email: bare?.toLowerCase() || null };
}

function oauthClient() {
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET");
  return new google.auth.OAuth2(id, secret, `${process.env.APP_URL}/api/google/callback`);
}

export function getGoogleAuthUrl(state: string) {
  return oauthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    state,
    scope: ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/userinfo.email", "openid"],
  });
}

export async function exchangeGoogleCode(code: string) {
  const auth = oauthClient();
  const { tokens } = await auth.getToken(code);
  auth.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth });
  const me = await oauth2.userinfo.get();
  return { refreshToken: tokens.refresh_token || null, email: me.data.email || null, scope: tokens.scope || null };
}

async function gmailClientForUser(userId: string) {
  const c = await getGmailConnection(userId);
  if (!c) throw new Error("GMAIL_NOT_CONNECTED");
  const auth = oauthClient();
  auth.setCredentials({
    refresh_token: decryptSecret({ ciphertext: c.refresh_token_ciphertext, iv: c.refresh_token_iv, tag: c.refresh_token_tag }),
  });
  return google.gmail({ version: "v1", auth });
}

export async function listMessageIds(userId: string, query: string, maxResults: number) {
  const gmail = await gmailClientForUser(userId);
  const ids: string[] = [];
  let pageToken: string | undefined;
  while (ids.length < maxResults) {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: Math.min(100, maxResults - ids.length),
      pageToken,
    });
    ids.push(...(response.data.messages || []).map((m) => m.id).filter((id): id is string => Boolean(id)));
    pageToken = response.data.nextPageToken || undefined;
    if (!pageToken) break;
  }
  return ids;
}

export async function getParsedMessage(userId: string, id: string): Promise<ParsedGmailMessage> {
  const gmail = await gmailClientForUser(userId);
  const response = await gmail.users.messages.get({ userId: "me", id, format: "full" });
  const message = response.data;
  const parts = collectParts(message.payload);
  const directBody = decode(message.payload?.body?.data);
  const bodyText = (parts.plain.join("\n\n") || parts.html.join("\n\n") || stripHtml(directBody) || message.snippet || "").slice(0, 100_000);
  const from = parseFrom(header(message, "From"));
  const internal = Number(message.internalDate || Date.now());
  return {
    gmailMessageId: message.id!,
    gmailThreadId: message.threadId || null,
    senderName: from.name,
    senderEmail: from.email,
    subject: header(message, "Subject") || "(No subject)",
    bodyText,
    snippet: message.snippet || bodyText.slice(0, 220),
    receivedAt: new Date(Number.isFinite(internal) ? internal : Date.now()),
  };
}
