import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import GlobalScoreToast from "@/components/GlobalScoreToast";
import GlobalSoundManager from "@/components/GlobalSoundManager";
import BackendStatusBanner from "@/components/BackendStatusBanner";
import { Inter, Playfair_Display, Krona_One } from "next/font/google";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600","700"], variable: "--font-playfair", display: "swap" });
const kronaOne = Krona_One({ subsets: ["latin"], weight: "400", variable: "--font-krona", display: "swap" });

export const metadata: Metadata = {
  title: "Search & Play",
  description: "Greek dictionary and word games",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#f97316",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${kronaOne.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <SessionProvider>
          <Navbar />
          <BackendStatusBanner />
          <main className="flex-grow">{children}</main>
          <Footer />
          <GlobalScoreToast />
          <GlobalSoundManager />
        </SessionProvider>
        <Script id="sw-register" strategy="afterInteractive">{`if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js')})}`}</Script>
        <Script src="https://code.responsivevoice.org/responsivevoice.js?key=FREE" strategy="afterInteractive" />
      </body>
    </html>
  );
}
