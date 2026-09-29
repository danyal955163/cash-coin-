import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/layout/Footer";
import "./globals.css";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const metadata: Metadata = { metadataBase: new URL("https://cash-coin-peach.vercel.app"), title: "CashCoin - Earn Real Money in Pakistan", description: "Pakistan's trusted task earning platform. Complete simple tasks and earn real money daily.", icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon.ico", sizes: "32x32" }], apple: "/apple-touch-icon.png", shortcut: "/favicon.ico" }, openGraph: { title: "CashCoin - Earn Real Money in Pakistan", description: "Pakistan's trusted task earning platform.", url: "https://cash-coin-peach.vercel.app", siteName: "CashCoin", images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CashCoin - Task Earning Platform" }], locale: "en_PK", type: "website" }, twitter: { card: "summary_large_image", title: "CashCoin - Earn Real Money in Pakistan", description: "Pakistan's trusted task earning platform.", images: ["/og-image.png"] } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false, themeColor: "#10B981" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className={`${inter.variable} bg-gray-50 font-sans text-gray-900`}>{children}<Footer /><Toaster position="top-right" /></body></html>; }
