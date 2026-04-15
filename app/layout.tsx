import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { UpdatePrompt } from "@/components/pwa/update-prompt";
import { ThemeProvider } from "@/lib/hooks/use-theme";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });

export const metadata: Metadata = {
  title: "Plate Progress - Track Your Workouts & Progress",
  description: "Lightning-fast mobile web app to log workouts, track PRs, and see your progress. Built for serious lifters.",
  keywords: "gym tracker, workout log, fitness app, PR tracker, strength training, workout planner, exercise tracker",
  authors: [{ name: "Plate Progress" }],
  manifest: "/manifest.json",
  themeColor: "#171612",
  viewport: {
    width: "device-width",
    initialScale: 1,
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
  // Icons are handled by app/icon.ico file-based metadata
  // icons config removed to prevent conflicts
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Configuration */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Plate Progress" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Google AdSense - Only loads if enabled */}
        {/* Using regular script tag instead of Next.js Script to avoid data-nscript attribute */}
        {process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true' && process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={`${archivo.className} app-bg`}>
        <ThemeProvider defaultTheme="system" storageKey="gym-tracker-theme">
          {children}
          <Toaster />
          <PWAInstallPrompt />
          <UpdatePrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
