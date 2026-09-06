import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getEmail } from "@/services/email.repository";
import { FIELD_CATALOG, fieldLabel } from "@/config/fields";
import { CATEGORIES } from "@/ai/types";
import { feedbackAction } from "@/app/actions";
import { Nav } from "@/components/Nav";

export default async function EmailDetails({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const u = await requireUser();
    const { id } = await params;

    const e = await getEmail(u.id, id);

    if (!e) notFound();

    return (
        <>
            <Nav name={u.display_name} />

            <main className="container narrow">

                {/* Back */}
                <a href="/" className="back-link">
                    ← الرجوع لصندوق الفرص
                </a>

                {/* Email Details */}
                <section className="card email-details">

                    <div className="email-header">
                        <span className="eyebrow">
                            HireMail AI
                        </span>

                        <h1>
                            {e.subject}
                        </h1>

                        <div className="meta">
                            <span>
                                {e.sender_name || e.sender_email}
                            </span>

                            <span>
                                {new Date(
                                    e.received_at
                                ).toLocaleString("ar-SA")}
                            </span>
                        </div>
                    </div>

                    {/* AI Summary */}
                    <div className="analysis-summary">
                        <div>
                            <small>الملخص</small>

                            <p className="summary">
                                {e.summary || "لا يوجد ملخص متاح لهذه الرسالة."}
                            </p>
                        </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="sectionhead">
                        <div>
                            <h2>تحليل الرسالة</h2>

                            <p className="muted">
                                المعلومات التي استخرجها HireMail AI من محتوى البريد.
                            </p>
                        </div>
                    </div>

                    <div className="analysisgrid">
                        <div>
                            <small>نوع الرسالة</small>
                            <b>{e.category}</b>
                        </div>

                        <div>
                            <small>المجال</small>
                            <b>
                                {fieldLabel(
                                    e.detected_field,
                                    "ar"
                                )}
                            </b>
                        </div>

                        <div>
                            <small>ثقة التصنيف</small>
                            <b>
                                {Math.round(
                                    e.category_score * 100
                                )}
                                %
                            </b>
                        </div>

                        <div>
                            <small>ثقة المجال</small>
                            <b>
                                {Math.round(
                                    e.field_score * 100
                                )}
                                %
                            </b>
                        </div>

                        <div>
                            <small>الشركة</small>
                            <b>
                                {e.company || "غير محدد"}
                            </b>
                        </div>

                        <div>
                            <small>المسمى الوظيفي</small>
                            <b>
                                {e.role_title || "غير محدد"}
                            </b>
                        </div>

                        <div>
                            <small>الإجراء المطلوب</small>
                            <b>
                                {e.required_action || "لا يوجد"}
                            </b>
                        </div>

                        <div>
                            <small>الموعد</small>
                            <b>
                                {e.deadline
                                    ? new Date(
                                        e.deadline
                                    ).toLocaleDateString("ar-SA")
                                    : "لا يوجد"}
                            </b>
                        </div>
                    </div>

                    {/* Original Email */}
                    <details className="email-content">
                        <summary>
                            عرض الرسالة الأصلية
                        </summary>

                        <pre className="emailbody">
                            {e.body_text}
                        </pre>
                    </details>

                </section>

                {/* Feedback */}
                <section className="card">

                    <div className="sectionhead">
                        <div>
                            <h2>هل التحليل صحيح؟</h2>

                            <p className="muted">
                                إذا لاحظت خطأ، صححه هنا حتى تتحسن التحليلات القادمة.
                            </p>
                        </div>
                    </div>

                    <form
                        action={feedbackAction}
                        className="feedback"
                    >
                        <input
                            type="hidden"
                            name="emailId"
                            value={e.id}
                        />

                        <label>
                            <span>
                                هل الرسالة مهنية وذات صلة؟
                            </span>

                            <select
                                name="isRelevant"
                                defaultValue={String(
                                    e.is_relevant
                                )}
                            >
                                <option value="true">
                                    نعم، ذات صلة
                                </option>

                                <option value="false">
                                    لا، ليست ذات صلة
                                </option>
                            </select>
                        </label>

                        <label>
                            <span>
                                نوع الرسالة
                            </span>

                            <select
                                name="category"
                                defaultValue={e.category}
                            >
                                {CATEGORIES.map((c) => (
                                    <option
                                        key={c}
                                        value={c}
                                    >
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span>
                                المجال
                            </span>

                            <select
                                name="field"
                                defaultValue={
                                    e.detected_field
                                }
                            >
                                <option value="GENERAL">
                                    عام
                                </option>

                                {FIELD_CATALOG.map((f) => (
                                    <option
                                        key={f.key}
                                        value={f.key}
                                    >
                                        {f.ar}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button type="submit">
                            حفظ التصحيح
                        </button>
                    </form>

                </section>

            </main>
        </>
    );
}