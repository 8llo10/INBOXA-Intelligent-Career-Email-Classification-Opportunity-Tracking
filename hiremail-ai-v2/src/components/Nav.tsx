import Link from "next/link";
import { logoutAction } from "@/app/actions";

export function Nav({ name }: { name: string }) {
    const firstName = name?.trim().split(" ")[0] || "المستخدم";

    return (
        <nav className="main-nav">
            {/* Brand */}
            <Link href="/" className="nav-brand">
                <span className="brand-icon">H</span>

                <div className="brand-copy">
                    <strong>HireMail AI</strong>
                    <small>Career Inbox</small>
                </div>
            </Link>

            {/* Navigation */}
            <div className="navlinks">
                <Link href="/" className="nav-link">
                    الرئيسية
                </Link>

                <Link href="/settings" className="nav-link">
                    تخصيص
                </Link>
            </div>

            {/* User */}
            <div className="nav-user">
                <div className="user-chip">
                    <span className="user-avatar">
                        {firstName.charAt(0)}
                    </span>

                    <span className="user-name">
                        {firstName}
                    </span>
                </div>

                <form action={logoutAction}>
                    <button type="submit" className="logout-btn">
                        تسجيل الخروج
                    </button>
                </form>
            </div>
        </nav>
    );
}