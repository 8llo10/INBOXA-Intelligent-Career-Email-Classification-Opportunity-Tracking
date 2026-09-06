function tokens(text: string) {
  return (text.toLowerCase().normalize("NFKC").match(/[\p{L}\p{N}_+#.-]{2,}/gu) || []).map(t => t.replace(/^[.-]+|[.-]+$/g, "")).filter(Boolean);
}
export type Prediction = { label: string; confidence: number; scores: Record<string, number>; reasons: string[] };
export class NaiveBayesClassifier {
  private labels = new Map<string, { docs: number; words: Map<string, number>; total: number }>(); private totalDocs = 0; private vocab = new Set<string>();
  train(rows: { text: string; label: string }[]) { for (const r of rows) { const ts = tokens(r.text); let s = this.labels.get(r.label); if (!s) { s = { docs: 0, words: new Map(), total: 0 }; this.labels.set(r.label, s); } s.docs++; this.totalDocs++; for (const t of ts) { s.words.set(t, (s.words.get(t) || 0) + 1); s.total++; this.vocab.add(t); } } return this; }
  predict(text: string): Prediction {
    const ts = tokens(text); const raw: Record<string, number> = {}; const reasons: string[] = []; const V = Math.max(this.vocab.size, 1); for (const [label, s] of this.labels) { let score = Math.log((s.docs + 1) / (this.totalDocs + this.labels.size)); for (const t of ts) score += Math.log(((s.words.get(t) || 0) + 1) / (s.total + V)); raw[label] = score; }
    const max = Math.max(...Object.values(raw)); const exp = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Math.exp(v - max)])); const sum = Object.values(exp).reduce((a, b) => a + b, 0) || 1; const scores = Object.fromEntries(Object.entries(exp).map(([k, v]) => [k, v / sum])); const label = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || ""; const confidence = scores[label] || 0;
    const winner = this.labels.get(label); if (winner) { const seen = [...new Set(ts)].map(t => [t, winner.words.get(t) || 0] as const).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 6); reasons.push(...seen.map(([t]) => t)); }
    return { label, confidence, scores, reasons };
  }
}
