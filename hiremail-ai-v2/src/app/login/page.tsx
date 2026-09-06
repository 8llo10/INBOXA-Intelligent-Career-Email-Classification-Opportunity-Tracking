import Link from "next/link";
import { loginAction } from "../actions";

export default async function Login({
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
          <span className="eyebrow">HireMail AI</span>

          <h1>جاهزين نلقط المهم من بريدك؟</h1>

          <p className="auth-description">
            سجّل دخولك وخل HireMail AI يرتب لك الرسائل المهنية
            ويعرض لك الفرص اللي تستحق انتباهك.
          </p>
        </div>

        {/* Login Error */}
        {q.error && (
          <div className="error" role="alert">
            البريد الإلكتروني أو كلمة المرور غير صحيحة.
          </div>
        )}

        {/* Login Form */}
        <form action={loginAction} className="auth-form">
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
              placeholder="••••••••"
              minLength={8}
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit">
            تسجيل الدخول
          </button>
        </form>

        {/* Registration */}
        <div className="auth-footer">
          <p>
            أول مرة هنا؟{" "}
            <Link href="/register">
              أنشئ حسابك
            </Link>
          </p>
        </div>

      </section>
    </main>
  );
}