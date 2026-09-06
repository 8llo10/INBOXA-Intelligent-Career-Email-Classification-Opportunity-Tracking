import type { Category } from "./types";

function clean(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

export function inferCompany(senderName: string | null, senderEmail: string | null) {
  if (senderName && !/no.?reply|recruit|talent|careers?/i.test(senderName)) {
    return clean(senderName).slice(0, 120);
  }
  const domain = senderEmail?.split("@")[1];
  if (!domain) return null;
  const base = domain.split(".")[0];
  if (["gmail", "outlook", "hotmail", "yahoo", "icloud"].includes(base)) {
    return senderName ? clean(senderName) : null;
  }
  return base.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export function inferRoleTitle(subject: string, body: string) {
  const text = `${subject}\n${body}`;
  const patterns = [
    /(?:position|role|vacancy|opening)\s*(?:of|for|:|-)?\s*([^\n.,;]{3,80})/i,
    /(?:وظيفة|منصب|شاغر|فرصة)\s*(?:بمسمى|كـ|:|-)?\s*([^\n،.;]{3,80})/i,
    /(?:interview for|application for)\s+([^\n.,;]{3,80})/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return clean(m[1]).slice(0, 100);
  }
  return null;
}

export function inferDeadline(body: string) {
  const iso = body.match(/\b(20\d{2})[-/]([01]?\d)[-/]([0-3]?\d)\b/);
  if (iso) {
    const d = new Date(`${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}T23:59:59Z`);
    if (!Number.isNaN(+d)) return d;
  }
  return null;
}

export function inferOpportunityType(c: Category) {
  const map: Record<string, string> = {
    JOB_OPPORTUNITY: "Job",
    RECRUITER_OUTREACH: "Recruiter outreach",
    INTERNSHIP: "Internship",
    GRADUATE_PROGRAM: "Graduate program",
    FREELANCE_PROJECT: "Freelance project",
    TECH_COLLABORATION: "Technical collaboration",
    PROFESSIONAL_COLLABORATION: "Professional collaboration",
    INTERVIEW: "Interview",
    ASSESSMENT: "Assessment",
    OFFER: "Offer",
    REJECTION: "Rejection",
    APPLICATION_RECEIVED: "Application received",
    APPLICATION_UPDATE: "Application update",
    EXPERIENCE_REQUEST: "Experience request",
  };
  return map[c] || null;
}

export function inferRequiredAction(c: Category, subject: string, body: string) {
  const t = `${subject} ${body}`.toLowerCase();
  if (/send|share|attach.{0,20}(cv|resume)|ارسل|أرسل|السيرة الذاتية/.test(t)) return "Send CV / profile";
  if (/schedule|book|confirm.{0,20}(interview|call)|حدد|تأكيد.{0,20}موعد|احجز/.test(t)) return "Schedule / confirm meeting";
  if (/complete|assessment|test|challenge|أكمل|اختبار|تقييم/.test(t)) return "Complete assessment";
  if (/reply|respond|let us know|رد|أخبرنا|تواصل/.test(t)) return "Reply to sender";
  if (c === "OFFER") return "Review offer";
  if (c === "REJECTION") return "No action required";
  return null;
}

export function extractiveSummary(subject: string, body: string) {
  const lines = body
    .split(/\n+/)
    .map(clean)
    .filter((x) => x.length > 20 && !/^https?:\/\//i.test(x));
  const picked: string[] = [];
  for (const line of lines) {
    if (!picked.includes(line)) {
      picked.push(line);
      if (picked.join(" ").length > 360) break;
    }
  }
  return picked.join(" ").slice(0, 420) || clean(subject).slice(0, 420);
}
