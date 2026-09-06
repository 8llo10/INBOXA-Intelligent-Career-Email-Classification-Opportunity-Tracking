import { requireUser } from "@/lib/auth";
import {
    getGmailConnection,
    getUserFields,
} from "@/services/user.repository";
import { FIELD_CATALOG } from "@/config/fields";
import {
    saveFieldsAction,
    disconnectGmailAction,
} from "../actions";
import { Nav } from "@/components/Nav";

export default async function Settings() {
    const u = await requireUser();

    const [conn, selected] = await Promise.all([
        getGmailConnection(u.id),
        getUserFields(u.id),
    ]);

    const all = selected.includes("ALL");

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

                {/* Page Header */}
                <div className="page-header">
                    <span className="eyebrow">HireMail AI</span>
                    <h1>الإعدادات</h1>
                    <p className="muted">
                        تحكّم في البريد المرتبط والمجالات التي تهمك.
                    </p>
                </div>

                {/* Gmail */}
                <section className="card">
                    <div className="sectionhead">
                        <div>
                            <h2>ربط Gmail</h2>
                            <p className="muted">
                                البريد الذي يستخدمه HireMail AI لفحص رسائلك المهنية.
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
                                    <strong>{conn.gmail_email}</strong>
                                </p>

                                <p className="muted">
                                    آخر مزامنة:{" "}
                                    {conn.last_sync_at
                                        ? new Date(
                                            conn.last_sync_at
                                        ).toLocaleString("ar-SA")
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

                                <form action={disconnectGmailAction}>
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
                                <h3>قبل ربط بريدك</h3>

                                <p>
                                    HireMail AI متاح حاليًا للمستخدمين المصرّح لهم فقط.
                                    إذا لم تتم إضافة بريدك بعد، أرسل طلب وصول أولًا.
                                </p>

                                <div className="access-steps">
                                    <p>
                                        <strong>1.</strong>{" "}
                                        أرسل طلب السماح باستخدام Gmail.
                                    </p>

                                    <p>
                                        <strong>2.</strong>{" "}
                                        بعد تأكيد إضافتك كمستخدم مصرح له، ارجع لهذه الصفحة.
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
                                إذا سبق وتمت الموافقة على بريدك، انتقل مباشرة إلى ربط Gmail.
                            </p>
                        </>
                    )}
                </section>

                {/* Fields */}
                <section className="card">
                    <div className="sectionhead">
                        <div>
                            <h2>مجالاتك المهنية</h2>

                            <p className="muted">
                                اختر المجالات التي تهمك حتى يركز HireMail AI
                                على الرسائل المهنية الأقرب لك.
                            </p>
                        </div>
                    </div>

                    <form
                        action={saveFieldsAction}
                        className="fields"
                    >
                        <label className="field all">
                            <input
                                type="checkbox"
                                name="ALL"
                                defaultChecked={all}
                            />

                            <span>
                                <b>جميع المجالات</b>
                                <small>
                                    لا تقيّد النتائج بمجال محدد
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
                                        !all && selected.includes(f.key)
                                    }
                                />

                                <span>
                                    <b>{f.ar}</b>
                                    <small>{f.en}</small>
                                </span>
                            </label>
                        ))}

                        <button type="submit">
                            حفظ المجالات
                        </button>
                    </form>

                    <p className="muted">
                        الرسائل المهنية العامة التي لا تنتمي إلى مجال واضح
                        ستظل قابلة للاكتشاف.
                    </p>
                </section>

            </main>
        </>
    );
}