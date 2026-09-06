import { FIELD_CATALOG } from "@/config/fields";
import { inferCompany, inferDeadline, inferOpportunityType, inferRequiredAction, inferRoleTitle, extractiveSummary } from "./extract";
import { NaiveBayesClassifier } from "./naive-bayes";
import { semanticField, semanticIntent } from "./semantic-signals";
import { INTENT_TRAINING } from "./training-data";
import type { Category, EmailAnalysis } from "./types";

export type FeedbackTrainingRow = { text: string; isRelevant: boolean; category: Category; field: string };

function intentModel(feedback: FeedbackTrainingRow[]) {
  return new NaiveBayesClassifier().train([
    ...INTENT_TRAINING,
    ...feedback.map((x) => ({ text: x.text, label: x.isRelevant ? x.category : ("NOT_RELEVANT" as Category) })),
  ]);
}
function fieldModel(feedback: FeedbackTrainingRow[]) {
  const rows = FIELD_CATALOG.flatMap((f) => f.examples.map((text) => ({ text, label: f.key })));
  rows.push({ text: "general career opportunity candidate profile professional background hiring recruitment فرصة مهنية مرشح خبرتك ملفك المهني", label: "GENERAL" });
  for (const f of feedback.filter((x) => x.isRelevant)) rows.push({ text: f.text, label: f.field || "GENERAL" });
  return new NaiveBayesClassifier().train(rows);
}

export function analyzeEmail(
  email: { subject: string; body: string; senderName: string | null; senderEmail: string | null },
  selectedFields: string[],
  feedback: FeedbackTrainingRow[] = [],
): EmailAnalysis {
  const combined = `${email.subject}\n${email.body}`.slice(0, 30_000);
  const modelIntent = intentModel(feedback).predict(combined);
  const modelField = fieldModel(feedback).predict(combined);
  const signalIntent = semanticIntent(combined);
  const signalField = semanticField(combined);

  // High-signal phrase evidence overrides a weak probabilistic guess; otherwise use the trained model.
  let category = modelIntent.label as Category;
  let categoryScore = modelIntent.confidence;
  if (signalIntent.score >= 2) {
    category = signalIntent.label;
    categoryScore = Math.min(0.98, 0.55 + signalIntent.score * 0.07);
  }
  const intentThreshold = Number(process.env.AI_INTENT_THRESHOLD || "0.28");
  const negativeLikely = category === "NOT_RELEVANT" || (modelIntent.label === "NOT_RELEVANT" && modelIntent.confidence > 0.55 && signalIntent.score < 2);
  const professional = !negativeLikely && (categoryScore >= intentThreshold || signalIntent.score >= 2 || (signalField.score >= 1.5 && modelIntent.confidence >= 0.20));

  let detectedField = modelField.label;
  let fieldScore = modelField.confidence;
  if (signalField.score >= 1.5) {
    detectedField = signalField.key;
    fieldScore = Math.min(0.98, 0.45 + signalField.score * 0.08);
  } else if (fieldScore < 0.22) {
    detectedField = "GENERAL";
  }

  if (category === "PROFESSIONAL_COLLABORATION" && detectedField === "TECHNOLOGY") category = "TECH_COLLABORATION";
  const allFields = selectedFields.includes("ALL");
  const fieldMatch = allFields || detectedField === "GENERAL" || selectedFields.includes(detectedField);
  const isRelevant = professional && fieldMatch;
  const finalCategory: Category = isRelevant ? category : "NOT_RELEVANT";

  const reasons = [
    `intent-model:${modelIntent.label}:${(modelIntent.confidence * 100).toFixed(1)}%`,
    `intent-signals:${signalIntent.label}:${signalIntent.score}`,
    `field-model:${modelField.label}:${(modelField.confidence * 100).toFixed(1)}%`,
    `field-signals:${signalField.key}:${signalField.score}`,
    `field-match:${fieldMatch}`,
    ...signalIntent.hits.map((x) => `intent-phrase:${x}`),
    ...signalField.hits.map((x) => `field-token:${x}`),
  ];

  return {
    isRelevant,
    professionalScore: professional ? Math.max(categoryScore, 1 - (modelIntent.scores.NOT_RELEVANT || 0)) : 1 - (modelIntent.scores.NOT_RELEVANT || 0),
    category: finalCategory,
    categoryScore,
    detectedField,
    fieldScore,
    company: isRelevant ? inferCompany(email.senderName, email.senderEmail) : null,
    roleTitle: isRelevant ? inferRoleTitle(email.subject, email.body) : null,
    opportunityType: isRelevant ? inferOpportunityType(category) : null,
    requiredAction: isRelevant ? inferRequiredAction(category, email.subject, email.body) : null,
    deadline: isRelevant ? inferDeadline(email.body) : null,
    summary: extractiveSummary(email.subject, email.body),
    reasons,
  };
}
