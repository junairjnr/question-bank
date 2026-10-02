import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Header } from "@/components/Header";
import { LoadGate } from "@/components/LoadGate";
import { QuizProvider } from "@/components/QuizProvider";
import "./globals.css";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "PPL Question Bank",
  description: "Private pilot licence practice questions",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${barlow.variable} ${plex.variable} ${mono.variable} antialiased`}>
        <QuizProvider>
          <Header />
          <main className="mx-auto max-w-[1040px] px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-5 max-sm:px-3">
            <LoadGate>{children}</LoadGate>
          </main>
        </QuizProvider>
      </body>
    </html>
  );
}
