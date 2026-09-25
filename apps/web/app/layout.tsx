import type { Metadata } from "next";
import { IBM_Plex_Mono, Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const display = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Playground — local labs for RAG, chains, graphs, and vectors",
  description: "A local, zero-cost playground for vector search, RAG, LangChain, and LangGraph. Nothing you type is kept.",
  icons: {
    icon: "/brand/favicon-32.png",
    apple: "/brand/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable} h-full`}>
      <body className="flex min-h-full flex-col font-[family-name:var(--font-sans)] antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
