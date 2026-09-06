import type { Category } from "./types";
import { FIELD_CATALOG } from "@/config/fields";

const CATEGORY_SIGNALS: Record<Category, string[]> = {
  JOB_OPPORTUNITY: [
    "we are hiring", "hiring for", "job opening", "vacancy", "open position", "join our team", "work with us", "career opportunity", "employment opportunity",
    "وظيفة شاغرة", "فرصة وظيفية", "نبحث عن", "مطلوب", "للعمل معنا", "انضمامك للفريق", "انضم لفريقنا", "نرغب بانضمامك", "لدينا شاغر"
  ],
  RECRUITER_OUTREACH: [
    "came across your profile", "saw your profile", "reviewed your profile", "your background", "your experience", "recruiter", "talent acquisition", "would like to discuss an opportunity", "reach out regarding",
    "اطلعت على ملفك", "اطلعنا على ملفك", "شاهدنا ملفك", "لفتتنا خبرتك", "خبرتك مناسبة", "نرغب بالتواصل معك", "بخصوص فرصة", "استقطاب", "مرشح"
  ],
  APPLICATION_RECEIVED: ["thank you for applying", "application received", "received your application", "successfully submitted", "تم استلام طلبك", "شكرا لتقديمك", "تم استلام طلب التوظيف", "تم إرسال طلبك بنجاح"],
  APPLICATION_UPDATE: ["application status", "under review", "reviewing your application", "candidate update", "next stage", "طلبك تحت المراجعة", "تحديث حالة الطلب", "حالة الترشيح", "قيد المراجعة"],
  INTERVIEW: ["interview", "schedule a call", "hiring manager", "meet the team", "phone screen", "screening call", "مقابلة", "موعد مقابلة", "تحديد موعد", "مقابلة شخصية", "مقابلة هاتفية"],
  ASSESSMENT: ["assessment", "coding challenge", "technical test", "online test", "case study", "complete the test", "اختبار تقني", "تقييم إلكتروني", "اختبار قدرات", "مهمة عملية", "أكمل الاختبار", "اختبار إلكتروني"],
  INTERNSHIP: ["internship", "intern position", "trainee", "summer training", "training opportunity", "تمهير", "تدريب صيفي", "فرصة تدريب", "متدرب", "برنامج تدريبي"],
  GRADUATE_PROGRAM: ["graduate program", "graduate development", "fresh graduate program", "future talent", "rotational program", "برنامج تطوير الخريجين", "برنامج خريجين", "حديثي التخرج", "مواهب المستقبل"],
  FREELANCE_PROJECT: ["freelance", "independent contractor", "paid project", "short term contract", "consulting project", "عمل حر", "مشروع مستقل", "عقد مؤقت", "تنفيذ مشروع بمقابل", "فريلانسر"],
  TECH_COLLABORATION: ["technical collaboration", "backend integration", "api integration", "development project", "software project", "تعاون تقني", "مشروع برمجي", "ربط الأنظمة", "تطوير النظام", "تطوير التطبيق"],
  PROFESSIONAL_COLLABORATION: ["professional collaboration", "collaborate with you", "partnership opportunity", "consulting collaboration", "work together on", "نرغب بالتعاون معك", "تعاون مهني", "شراكة مهنية", "نحتاج خبرتك", "مشاركتك في المشروع"],
  EXPERIENCE_REQUEST: ["send your cv", "share your cv", "send your resume", "share your resume", "portfolio", "salary expectations", "availability", "notice period", "أرسل سيرتك", "ارسلي سيرتك", "السيرة الذاتية", "شارك خبرتك", "البورتفوليو", "توقعات الراتب", "متى تستطيع البدء"],
  OFFER: ["pleased to offer", "offer letter", "employment offer", "compensation package", "start date", "عرض وظيفي", "يسعدنا تقديم عرض", "خطاب العرض", "الراتب المقترح", "تاريخ المباشرة"],
  REJECTION: ["other candidates", "not selected", "unsuccessful application", "unfortunately", "will not be moving forward", "decided not to proceed", "لم يتم اختيارك", "نعتذر", "مرشحين آخرين", "عدم اجتياز", "لن نستكمل"],
  NOT_RELEVANT: ["bank statement", "invoice", "receipt", "password reset", "verification code", "one-time password", "order shipped", "delivery", "newsletter", "promotion", "discount", "فاتورة", "كشف حساب", "رمز تحقق", "إعادة تعيين كلمة المرور", "تم شحن طلبك", "خصم", "عرض تسويقي", "توصيل الطلب"]
};

function normalize(text: string) { return text.toLowerCase().normalize("NFKC").replace(/[ـًٌٍَُِّْ]/g, "").replace(/\s+/g, " "); }

export function semanticIntent(text: string) {
  const t = normalize(text); const scores: Record<string, number> = {};
  for (const [category, phrases] of Object.entries(CATEGORY_SIGNALS)) {
    let score = 0; const hits: string[] = [];
    for (const p of phrases) { const q = normalize(p); if (t.includes(q)) { score += q.includes(" ") ? 2 : 1; hits.push(p); } }
    scores[category] = score;
  }
  // Negative signals should win only when professional evidence is absent/weak.
  const positive = Object.entries(scores).filter(([k]) => k !== "NOT_RELEVANT").sort((a, b) => b[1] - a[1]);
  const best = positive[0] || ["NOT_RELEVANT", 0]; const negative = scores.NOT_RELEVANT || 0;
  if (negative >= 2 && Number(best[1]) < 2) return { label: "NOT_RELEVANT" as Category, score: negative, hits: [] as string[] };
  return { label: best[0] as Category, score: Number(best[1]), hits: CATEGORY_SIGNALS[best[0] as Category].filter(p => t.includes(normalize(p))).slice(0, 6) };
}

export function semanticField(text: string) {
  const t = normalize(text); const words = new Set(t.match(/[\p{L}\p{N}+#]{3,}/gu) || []);
  let best = { key: "GENERAL", score: 0, hits: [] as string[] };
  for (const f of FIELD_CATALOG) {
    const source = normalize(f.examples.join(" ")); const keywords = [...new Set(source.match(/[\p{L}\p{N}+#]{3,}/gu) || [])];
    const hits = keywords.filter(k => words.has(k));
    let score = hits.length;
    // Strong domain-specific words count more.
    const strong = hits.filter(x => x.length >= 6); score += strong.length * 0.5;
    if (score > best.score) best = { key: f.key, score, hits: hits.slice(0, 8) };
  }
  return best;
}
