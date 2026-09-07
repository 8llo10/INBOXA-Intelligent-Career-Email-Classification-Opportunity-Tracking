import { requireUser } from "@/lib/auth";

import {
    getGmailConnection,
} from "@/services/user.repository";

import {
    disconnectGmailAction,
} from "../actions";

import { Nav } from "@/components/Nav";

export default async function Settings() {
    const u = await requireUser();

    const conn = await getGmailConnection(u.id);

    const accessRequestSubject = encodeURIComponent(
        "HireMail AI - Gmail Access Request"
    );

    const accessRequestBody = encodeURIComponent(
        `مرحبًا،

أرغب في طلب السماح بربط حساب Gmail الخاص بي مع HireMail AI.

الاسم: ${u.display_name}
البريد المستخدم في HireMail AI: ${u.email}

شكرًا.`
    );

    const accessRequestUrl =
        `mailto:ghalaalameer8@gmail.com` +
        `?subject=${accessRequestSubject}` +
        `&body=${accessRequestBody}`;

    return (
        <>
            <Nav name={u.display_name} />

            <main className="container narrow">

                {/* ============================== */}
                {/* PAGE HEADER */}
                {/* ============================== */}

                <div className="page-header">
                    <span className="eyebrow">
                        حسابك
                    </span>

                    <h1>
                        تخصيص الحساب
                    </h1>

                    <p className="muted">
                        إدارة البريد المرتبط، المزامنة، والتنبيهات الخاصة بحسابك.
                    </p>
                </div>


                {/* ============================== */}
                {/* GMAIL */}
                {/* ============================== */}

                <section className="card">

                    <div className="sectionhead">

                        <div>
                            <h2>
                                البريد المرتبط
                            </h2>

                            <p className="muted">
                                الحساب الذي يعتمد عليه HireMail AI
                                لفحص رسائلك المهنية.
                            </p>
                        </div>

                        {conn && (
                            <span className="badge">
                                متصل
                            </span>
                        )}

                    </div>


                    {conn ? (
                        <>

                            <div className="connection-info">

                                <p>
                                    متصل مع{" "}
                                    <strong>
                                        {conn.gmail_email}
                                    </strong>
                                </p>

                                <p className="muted">
                                    آخر مزامنة:{" "}
                                    {conn.last_sync_at
                                        ? new Date(
                                            conn.last_sync_at
                                        ).toLocaleString(
                                            "ar-SA",
                                            {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            }
                                        )
                                        : "لم تتم المزامنة بعد"}
                                </p>

                            </div>


                            <div className="inline">

                                <a
                                    className="button secondary"
                                    href="/api/google/connect"
                                >
                                    إعادة ربط Gmail
                                </a>


                                <form
                                    action={disconnectGmailAction}
                                >
                                    <button
                                        type="submit"
                                        className="danger"
                                    >
                                        فصل Gmail
                                    </button>
                                </form>

                            </div>

                        </>
                    ) : (
                        <>

                            <div className="gmail-access">

                                <h3>
                                    قبل ربط بريدك
                                </h3>

                                <p>
                                    HireMail AI متاح حاليًا للمستخدمين
                                    المصرّح لهم فقط. إذا لم تتم إضافة بريدك
                                    بعد، أرسل طلب وصول أولًا.
                                </p>


                                <div className="access-steps">

                                    <p>
                                        <strong>1.</strong>{" "}
                                        أرسل طلب السماح باستخدام Gmail.
                                    </p>

                                    <p>
                                        <strong>2.</strong>{" "}
                                        بعد تأكيد إضافتك كمستخدم مصرح له،
                                        ارجع لهذه الصفحة.
                                    </p>

                                    <p>
                                        <strong>3.</strong>{" "}
                                        اربط Gmail ووافق على صلاحية قراءة البريد.
                                    </p>

                                </div>

                            </div>


                            <div className="inline">

                                <a
                                    className="button secondary"
                                    href={accessRequestUrl}
                                >
                                    إرسال طلب الوصول
                                </a>


                                <a
                                    className="button"
                                    href="/api/google/connect"
                                >
                                    ربط Gmail
                                </a>

                            </div>


                            <p className="muted">
                                إذا سبق وتمت الموافقة على بريدك،
                                انتقل مباشرة إلى ربط Gmail.
                            </p>

                        </>
                    )}

                </section>


                {/* ============================== */}
                {/* ACTIVITY */}
                {/* ============================== */}

                <section className="card">

                    <div className="sectionhead">

                        <div>
                            <h2>
                                النشاط والمزامنة
                            </h2>

                            <p className="muted">
                                نظرة سريعة على حالة البريد وآخر تحديث لحسابك.
                            </p>
                        </div>

                    </div>


                    <div className="settings-grid">

                        <div className="settings-item">

                            <span className="settings-label">
                                حالة Gmail
                            </span>

                            <strong>
                                {conn
                                    ? "متصل"
                                    : "غير متصل"}
                            </strong>

                        </div>


                        <div className="settings-item">

                            <span className="settings-label">
                                البريد المستخدم
                            </span>

                            <strong>
                                {conn?.gmail_email || "لا يوجد"}
                            </strong>

                        </div>


                        <div className="settings-item">

                            <span className="settings-label">
                                آخر مزامنة
                            </span>

                            <strong>
                                {conn?.last_sync_at
                                    ? new Date(
                                        conn.last_sync_at
                                    ).toLocaleDateString(
                                        "ar-SA",
                                        {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }
                                    )
                                    : "لا يوجد"}
                            </strong>

                        </div>


                        <div className="settings-item">

                            <span className="settings-label">
                                وقت آخر مزامنة
                            </span>

                            <strong>
                                {conn?.last_sync_at
                                    ? new Date(
                                        conn.last_sync_at
                                    ).toLocaleTimeString(
                                        "ar-SA",
                                        {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )
                                    : "—"}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* ============================== */}
                {/* NOTIFICATIONS */}
                {/* ============================== */}

                <section className="card">

                    <div className="sectionhead">

                        <div>
                            <h2>
                                الإشعارات
                            </h2>

                            <p className="muted">
                                تنبيهات تساعدك تلاحظ الرسائل التي تحتاج
                                متابعة سريعة.
                            </p>
                        </div>

                        <span className="badge">
                            قريبًا
                        </span>

                    </div>


                    <div className="notification-preview">

                        <div className="notification-item">

                            <div>
                                <strong>
                                    المقابلات والمواعيد
                                </strong>

                                <p className="muted">
                                    تنبيه عند اكتشاف مقابلة أو موعد
                                    مرتبط بفرصة مهنية.
                                </p>
                            </div>

                            <span className="notification-status">
                                قريبًا
                            </span>

                        </div>


                        <div className="notification-item">

                            <div>
                                <strong>
                                    العروض الوظيفية
                                </strong>

                                <p className="muted">
                                    تنبيه عند وصول عرض وظيفي
                                    أو تحديث مهم على طلبك.
                                </p>
                            </div>

                            <span className="notification-status">
                                قريبًا
                            </span>

                        </div>


                        <div className="notification-item">

                            <div>
                                <strong>
                                    الإجراءات والمواعيد النهائية
                                </strong>

                                <p className="muted">
                                    تنبيه إذا احتوت الرسالة على إجراء مطلوب
                                    أو موعد نهائي يحتاج انتباهك.
                                </p>
                            </div>

                            <span className="notification-status">
                                قريبًا
                            </span>

                        </div>

                    </div>

                </section>

            </main>
        </>
    );
}