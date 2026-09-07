import Link from "next/link";
import { registerAction } from "../actions";

export default async function Register({
    searchParams,
}: {
    searchParams: Promise<Record<string, string>>;
}) {
    const q = await searchParams;

    return (
        <main className="auth">
            <section className="card authcard">

                {/* Brand */}
                <div className="auth-brand">
                    <img
                        src="/images/hiremail-logo.png"
                        alt="HireMail AI"
                        className="auth-logo-image"
                    />
                    <span className="eyebrow">HireMail AI</span>

                    <h1>خلّ بريدك يشتغل لصالحك ✦</h1>

                    <p className="auth-description">
                        أنشئ حسابك، وبعدها جهّز صندوقك المهني عشان تجمع
                        الفرص والرسائل المهمة في مكان واحد.
                    </p>
                </div>

                {/* Registration Error */}
                {q.error && (
                    <div className="error" role="alert">
                        تعذّر إنشاء الحساب. تحقق من البيانات أو جرّب بريدًا آخر.
                    </div>
                )}

                {/* Registration Form */}
                <form action={registerAction} className="auth-form">

                    <label>
                        <span>الاسم</span>
                        <input
                            name="name"
                            type="text"
                            placeholder="اكتب اسمك"
                            autoComplete="name"
                            minLength={2}
                            required
                        />
                    </label>

                    <label>
                        <span>البريد الإلكتروني</span>
                        <input
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            autoComplete="email"
                            required
                        />
                    </label>

                    <label>
                        <span>كلمة المرور</span>
                        <input
                            name="password"
                            type="password"
                            placeholder="8 أحرف على الأقل"
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />
                    </label>

                    <button type="submit">
                        إنشاء الحساب
                    </button>

                </form>

                {/* Login */}
                <div className="auth-footer">
                    <p>
                        عندك حساب بالفعل؟{" "}
                        <Link href="/login">
                            تسجيل الدخول
                        </Link>
                    </p>
                </div>

            </section>
        </main>
    );
}