import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/layout/Footer";
import "./globals.css";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const metadata: Metadata = { metadataBase: new URL("https://cash-coin-peach.vercel.app"), title: "CashCoin - Earn Real Money in Pakistan", description: "Pakistan's trusted task earning platform.", icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon.ico", sizes: "any" }], apple: "/apple-touch-icon.png", shortcut: "/favicon.ico" }, openGraph: { title: "CashCoin - Earn Real Money in Pakistan", description: "Pakistan's trusted task earning platform.", url: "https://cash-coin-peach.vercel.app", siteName: "CashCoin", images: [{ url: "/og-image.png", width: 1200, height: 630 }], locale: "en_PK", type: "website" }, twitter: { card: "summary_large_image", title: "CashCoin - Earn Real Money in Pakistan", images: ["/og-image.png"] }, verification: { google: "B-Jmc2XTxhBoEJVNxR8xf4vn4umMJOTN_fS_8P01gfc" }, other: { monetag: "5e6f4327b4ffaf8357d8bc41de2c1bd6" } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false, themeColor: "#10B981" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><head><link rel="icon" href="/icon.svg" type="image/svg+xml" /><link rel="icon" href="/favicon.ico" sizes="any" /><link rel="apple-touch-icon" href="/apple-touch-icon.png" /></head><body className={`${inter.variable} bg-gray-50 font-sans text-gray-900`}>{children}<Footer /><Toaster position="top-right" /></body></html>; }
