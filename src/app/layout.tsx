// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/provider/ReduxProvider";
import AuthGuard from "@/auth/authGuard";


export const metadata: Metadata = {
  title: "AI Paraphrasing Checking System",
  description: "Advanced AI-powered paraphrasing detection for academic integrity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </ReduxProvider>
      </body>
    </html>
  );
}