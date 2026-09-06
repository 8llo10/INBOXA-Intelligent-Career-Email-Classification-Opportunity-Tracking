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
            <body>{children}</body>
        </html>
    );
}