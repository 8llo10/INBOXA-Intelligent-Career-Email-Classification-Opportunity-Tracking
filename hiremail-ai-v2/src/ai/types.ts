export const CATEGORIES = [
  "JOB_OPPORTUNITY", "RECRUITER_OUTREACH", "APPLICATION_RECEIVED", "APPLICATION_UPDATE", "INTERVIEW", "ASSESSMENT", "INTERNSHIP", "GRADUATE_PROGRAM", "FREELANCE_PROJECT", "TECH_COLLABORATION", "PROFESSIONAL_COLLABORATION", "EXPERIENCE_REQUEST", "OFFER", "REJECTION", "NOT_RELEVANT"
] as const;
export type Category = typeof CATEGORIES[number];
export type FieldKey = string;
export type EmailAnalysis = {
  isRelevant: boolean; professionalScore: number; category: Category; categoryScore: number;
  detectedField: FieldKey; fieldScore: number; company: string | null; roleTitle: string | null;
  opportunityType: string | null; requiredAction: string | null; deadline: Date | null; summary: string; reasons: string[];
};
