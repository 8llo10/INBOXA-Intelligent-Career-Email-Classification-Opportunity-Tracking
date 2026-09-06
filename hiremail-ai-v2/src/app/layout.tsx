import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "HireMail AI",
        template: "%s | HireMail AI",
    },

    description:
        "Your professional inbox for discovering, organizing, and tracking career opportunities from Gmail.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <body>
                {/* ============================= */}
                {/* GLOBAL VIDEO BACKGROUND */}
                {/* ============================= */}

                <div className="site-background" aria-hidden="true">

                    {/* Laptop / Desktop */}
                    <video
                        className="background-video background-desktop"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                    >
                        <source
                            src="/videos/background-desktop.mp4"
                            type="video/mp4"
                        />
                    </video>

                    {/* Mobile */}
                    <video
                        className="background-video background-mobile"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                    >
                        <source
                            src="/videos/background-mobile.mp4"
                            type="video/mp4"
                        />
                    </video>

                    {/* الغباش فوق الفيديو */}
                    <div className="background-blur" />

                    {/* طبقة شفافة لراحة القراءة */}
                    <div className="background-overlay" />
                </div>

                {/* ============================= */}
                {/* WEBSITE */}
                {/* ============================= */}

                <div className="site-content">
                    {children}
                </div>
            </body>
        </html>
    );
}