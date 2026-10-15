import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/lib/auth/user-context";

export const metadata: Metadata = {
  title: "Nexora — AI Learning Platform for Students",
  description:
    "An AI-powered learning companion for students to upload study PDFs, ask grounded questions with exact page references, practice active-recall flashcards, take quizzes, and prepare for exams.",
  icons: {
    icon: "/logo.png",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#F7F9FD] text-[#1D156B] font-sans antialiased selection:bg-[#DCF090] selection:text-[#1D156B]">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
