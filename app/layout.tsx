import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { ThemeProvider } from "@/lib/hooks/use-theme";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Plate Progress - Track Your Workouts & Progress",
  description: "Lightning-fast mobile web app to log workouts, track PRs, and see your progress. Built for serious lifters.",
  keywords: "gym tracker, workout log, fitness app, PR tracker, strength training, workout planner, exercise tracker",
  authors: [{ name: "Plate Progress" }],
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Plate Progress",
  },
  openGraph: {
    title: "Plate Progress",
    description: "Track your workouts, see your progress, crush your PRs",
    type: "website",
    url: "https://plateprogress.com",
    siteName: "Plate Progress",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Plate Progress",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plate Progress",
    description: "Track your workouts, see your progress, crush your PRs",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="gym-tracker-theme">
          {children}
          <Toaster />
          <PWAInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
