import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
    listEmails,
    dashboardStats,
} from "@/services/email.repository";
import { getGmailConnection } from "@/services/user.repository";
import { syncNowAction } from "./actions";
import { fieldLabel } from "@/config/fields";
import { Nav } from "@/components/Nav";

export default async function Home() {
    const u = await requireUser();

    const [emails, stats, conn] = await Promise.all([
        listEmails(u.id, { relevant: true, limit: 100 }),
        dashboardStats(u.id),
        getGmailConnection(u.id),
    ]);

    return (
        <>
            <Nav name={u.display_name} />

            <main className="container">

                {/* Welcome / Main Action */}
                <section className="hero">
                    <div>
                        <span className="eyebrow">HireMail AI</span>

                        <h1>
                            أهلًا {u.display_name} 👋
                        </h1>

                        <p>
                            هنا تلقى أهم الرسائل المهنية اللي وصلتك بدون ما تضيع بين
                            زحمة البريد.
                        </p>
                    </div>

                    {conn ? (
                        <form action={syncNowAction}>
                            <button type="submit">
                                فحص الرسائل الجديدة
                            </button>
                        </form>
                    ) : (
                        <Link className="button" href="/settings">
                            إعداد Gmail
                        </Link>
                    )}
                </section>

                {/* Gmail Status */}
                <section className="card gmail-status">
                    {conn ? (
                        <div className="sectionhead">
                            <div>
                                <strong>Gmail متصل ✓</strong>
                                <p className="muted">
                                    {conn.gmail_email}
                                </p>
                            </div>

                            <span className="muted">
                                جاهز لفحص الرسائل المهنية
                            </span>
                        </div>
                    ) : (
                        <div className="sectionhead">
                            <div>
                                <strong>Gmail غير متصل</strong>
                                <p className="muted">
                                    اربط بريدك حتى يبدأ HireMail AI في اكتشاف الرسائل المهنية.
                                </p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Statistics */}
                <section className="stats">
                    <div>
                        <b>{stats?.total || 0}</b>
                        <span>الرسائل المهنية</span>
                    </div>

                    <div>
                        <b>{stats?.interviews || 0}</b>
                        <span>مقابلات</span>
                    </div>

                    <div>
                        <b>{stats?.assessments || 0}</b>
                        <span>اختبارات</span>
                    </div>

                    <div>
                        <b>{stats?.offers || 0}</b>
                        <span>عروض</span>
                    </div>

                    <div>
                        <b>{stats?.rejections || 0}</b>
                        <span>رفض</span>
                    </div>
                </section>

                {/* Professional Emails */}
                <section className="card">
                    <div className="sectionhead">
                        <div>
                            <h2>صندوق الفرص المهنية</h2>
                            <p className="muted">
                                الرسائل التي تم تصنيفها على أنها مرتبطة بمسارك المهني.
                            </p>
                        </div>

                        {conn && (
                            <span className="muted">
                                {emails.length} رسالة
                            </span>
                        )}
                    </div>

                    <div className="tablewrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>المرسل / الشركة</th>
                                    <th>الملخص</th>
                                    <th>النوع</th>
                                    <th>المجال</th>
                                    <th>التاريخ</th>
                                </tr>
                            </thead>

                            <tbody>
                                {emails.map((e) => (
                                    <tr key={e.id}>
                                        <td>
                                            <Link href={`/emails/${e.id}`}>
                                                <strong>
                                                    {e.company ||
                                                        e.sender_name ||
                                                        e.sender_email ||
                                                        "—"}
                                                </strong>

                                                <small>{e.subject}</small>
                                            </Link>
                                        </td>

                                        <td>
                                            {e.summary || e.snippet}
                                        </td>

                                        <td>
                                            <span className="badge">
                                                {e.category}
                                            </span>
                                        </td>

                                        <td>
                                            {fieldLabel(e.detected_field, "ar")}
                                        </td>

                                        <td>
                                            {new Date(
                                                e.received_at
                                            ).toLocaleDateString("ar-SA")}
                                        </td>
                                    </tr>
                                ))}

                                {!emails.length && (
                                    <tr>
                                        <td colSpan={5} className="empty">
                                            {conn
                                                ? "ما لقينا رسائل مهنية مصنفة حتى الآن. جرّب فحص الرسائل الجديدة."
                                                : "ابدأ بإعداد Gmail حتى نقدر نبحث عن فرصك ورسائلك المهنية."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

            </main>
        </>
    );
}