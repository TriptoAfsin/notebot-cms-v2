import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ProgressBar } from "@/components/progress-bar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NoteBot CMS",
    template: "%s | NoteBot CMS",
  },
  description:
    "Content management system for NoteBot - manage notes, lab reports, question banks, routines, and results for students.",
  keywords: [
    "NoteBot",
    "CMS",
    "notes",
    "education",
    "lab reports",
    "question banks",
  ],
  authors: [{ name: "NoteBot Team" }],
  openGraph: {
    title: "NoteBot CMS",
    description:
      "Content management system for NoteBot - manage educational content for students.",
    siteName: "NoteBot CMS",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "NoteBot CMS",
    description:
      "Content management system for NoteBot - manage educational content for students.",
  },
  icons: {
    icon: "/icon.svg",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider>
            <ProgressBar />
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
