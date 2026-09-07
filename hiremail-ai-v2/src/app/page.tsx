import Link from "next/link";

import { requireUser } from "@/lib/auth";

import {
    listEmails,
    dashboardStats,
} from "@/services/email.repository";

import {
    getGmailConnection,
    getUserFields,
} from "@/services/user.repository";

import {
    FIELD_CATALOG,
    fieldLabel,
} from "@/config/fields";

import {
    syncNowAction,
    saveFieldsAction,
} from "./actions";

import { Nav } from "@/components/Nav";

export default async function Home() {
    const u = await requireUser();

    const [emails, stats, conn, selected] = await Promise.all([
        listEmails(u.id, { relevant: true, limit: 100 }),
        dashboardStats(u.id),
        getGmailConnection(u.id),
        getUserFields(u.id),
    ]);

    const all = selected.includes("ALL");

    return (
        <>
            <Nav name={u.display_name} />

            <main className="container">

                {/* ============================== */}
                {/* HERO */}
                {/* ============================== */}

                <section className="hero">

                    <div>
                        <span className="eyebrow">
                            مرحبًا، {u.display_name}
                        </span>

                        <h1>
                            فرصك المهنية، في مكان واحد.
                        </h1>

                        <p>
                            HireMail AI يرتب رسائلك المهنية ويجمع لك
                            المقابلات والعروض والتحديثات المهمة بدون ما تضيع
                            بين زحمة البريد.
                        </p>
                    </div>


                    {conn ? (
                        <form action={syncNowAction}>
                            <button type="submit">
                                فحص الرسائل الجديدة
                            </button>
                        </form>
                    ) : (
                        <Link
                            className="button"
                            href="/settings"
                        >
                            إعداد Gmail
                        </Link>
                    )}

                </section>


                {/* ============================== */}
                {/* GMAIL STATUS */}
                {/* ============================== */}

                <section className="card gmail-status">

                    {conn ? (

                        <div className="sectionhead">

                            <div>
                                <strong>
                                    Gmail متصل ✓
                                </strong>

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
                                <strong>
                                    Gmail غير متصل
                                </strong>

                                <p className="muted">
                                    اربط بريدك حتى يبدأ HireMail AI
                                    في اكتشاف الرسائل المهنية.
                                </p>
                            </div>

                        </div>

                    )}

                </section>


                {/* ============================== */}
                {/* STATISTICS */}
                {/* ============================== */}

                <section className="stats">

                    <div>
                        <b>
                            {stats?.total || 0}
                        </b>

                        <span>
                            الرسائل المهنية
                        </span>
                    </div>


                    <div>
                        <b>
                            {stats?.interviews || 0}
                        </b>

                        <span>
                            مقابلات
                        </span>
                    </div>


                    <div>
                        <b>
                            {stats?.assessments || 0}
                        </b>

                        <span>
                            اختبارات
                        </span>
                    </div>


                    <div>
                        <b>
                            {stats?.offers || 0}
                        </b>

                        <span>
                            عروض
                        </span>
                    </div>


                    <div>
                        <b>
                            {stats?.rejections || 0}
                        </b>

                        <span>
                            رفض
                        </span>
                    </div>

                </section>


                {/* ============================== */}
                {/* PROFESSIONAL FIELD FILTER */}
                {/* ============================== */}

                <section className="card dashboard-filter">

                    <div className="sectionhead">

                        <div>
                            <h2>
                                اهتماماتك المهنية
                            </h2>

                            <p className="muted">
                                حدد المجالات التي تريد أن يركز عليها
                                HireMail AI أثناء تحليل رسائلك.
                            </p>
                        </div>


                        <span className="badge">
                            {all
                                ? "جميع المجالات"
                                : `${selected.length} محدد`}
                        </span>

                    </div>


                    <details className="filter-details">

                        <summary>
                            تعديل المجالات
                        </summary>


                        <form
                            action={saveFieldsAction}
                            className="fields dashboard-fields"
                        >

                            <label className="field all">

                                <input
                                    type="checkbox"
                                    name="ALL"
                                    defaultChecked={all}
                                />

                                <span>
                                    <b>
                                        جميع المجالات
                                    </b>

                                    <small>
                                        اكتشاف الرسائل المهنية
                                        بدون تقييد بمجال محدد
                                    </small>
                                </span>

                            </label>


                            {FIELD_CATALOG.map((f) => (

                                <label
                                    className="field"
                                    key={f.key}
                                >

                                    <input
                                        type="checkbox"
                                        name={f.key}
                                        defaultChecked={
                                            !all &&
                                            selected.includes(f.key)
                                        }
                                    />

                                    <span>
                                        <b>
                                            {f.ar}
                                        </b>

                                        <small>
                                            {f.en}
                                        </small>
                                    </span>

                                </label>

                            ))}


                            <button type="submit">
                                حفظ المجالات
                            </button>

                        </form>

                    </details>


                    <p className="muted dashboard-filter-note">
                        الرسائل المهنية العامة التي لا تنتمي إلى مجال واضح
                        ستظل قابلة للاكتشاف.
                    </p>

                </section>


                {/* ============================== */}
                {/* PROFESSIONAL EMAILS */}
                {/* ============================== */}

                <section className="card">

                    <div className="sectionhead">

                        <div>
                            <h2>
                                صندوق الفرص المهنية
                            </h2>

                            <p className="muted">
                                الرسائل التي تم تصنيفها على أنها
                                مرتبطة بمسارك المهني.
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
                                    <th>
                                        المرسل / الشركة
                                    </th>

                                    <th>
                                        الملخص
                                    </th>

                                    <th>
                                        النوع
                                    </th>

                                    <th>
                                        المجال
                                    </th>

                                    <th>
                                        التاريخ
                                    </th>
                                </tr>
                            </thead>


                            <tbody>

                                {emails.map((e) => (

                                    <tr key={e.id}>

                                        <td>

                                            <Link
                                                href={`/emails/${e.id}`}
                                            >

                                                <strong>
                                                    {e.company ||
                                                        e.sender_name ||
                                                        e.sender_email ||
                                                        "—"}
                                                </strong>

                                                <small>
                                                    {e.subject}
                                                </small>

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
                                            {fieldLabel(
                                                e.detected_field,
                                                "ar"
                                            )}
                                        </td>


                                        <td>
                                            {new Date(
                                                e.received_at
                                            ).toLocaleDateString(
                                                "ar-SA"
                                            )}
                                        </td>

                                    </tr>

                                ))}


                                {!emails.length && (

                                    <tr>

                                        <td
                                            colSpan={5}
                                            className="empty"
                                        >
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