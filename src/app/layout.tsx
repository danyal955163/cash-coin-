import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/layout/Footer";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "../../messages/en.json";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://cash-coin-peach.vercel.app"), title: "CashCoin - Earn Real Money in Pakistan", description: "Pakistan's trusted task earning platform.", manifest: "/manifest.json", appleWebApp: { capable: true, statusBarStyle: "default", title: "CashCoin" }, formatDetection: { telephone: false }, icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon.ico", sizes: "any" }], apple: "/icon-192.png", shortcut: "/favicon.ico" }, openGraph: { title: "CashCoin - Earn Real Money in Pakistan", description: "Pakistan's trusted task earning platform.", url: "https://cash-coin-peach.vercel.app", siteName: "CashCoin", images: [{ url: "/og-image.png", width: 1200, height: 630 }], locale: "en_PK", type: "website" }, twitter: { card: "summary_large_image", title: "CashCoin - Earn Real Money in Pakistan", images: ["/og-image.png"] }, verification: { google: "B-Jmc2XTxhBoEJVNxR8xf4vn4umMJOTN_fS_8P01gfc" }, other: { monetag: "5e6f4327b4ffaf8357d8bc41de2c1bd6" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false, themeColor: "#10B981" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" dir="ltr" suppressHydrationWarning><head><link rel="manifest" href="/manifest.json" /><meta name="theme-color" content="#10B981" /><meta name="apple-mobile-web-app-capable" content="yes" /><meta name="apple-mobile-web-app-status-bar-style" content="default" /><meta name="apple-mobile-web-app-title" content="CashCoin" /><link rel="icon" href="/icon.svg" type="image/svg+xml" /><link rel="icon" href="/favicon.ico" sizes="any" /><link rel="apple-touch-icon" href="/icon-192.png" /></head><body className={`${inter.variable} bg-gray-50 font-sans text-gray-900`}><NextIntlClientProvider locale="en" messages={enMessages}><LanguageProvider><ServiceWorkerRegister />{children}<Footer /><Toaster position="top-center" toastOptions={{ duration: 4000, style: { maxWidth: "calc(100vw - 24px)", fontSize: "14px", padding: "12px 16px", borderRadius: "12px", wordBreak: "break-word" }, success: { style: { background: "#10B981", color: "white" } }, error: { style: { background: "#EF4444", color: "white" } } }} containerStyle={{ top: 16, left: 12, right: 12 }} /></LanguageProvider></NextIntlClientProvider></body></html>;
}
