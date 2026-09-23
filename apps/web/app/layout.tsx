import type { Metadata } from "next";
import { Figtree, Newsreader } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import "./globals.css";

const display = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Playground — see how AI meets a life",
  description: "A local, zero-cost playground for vector search, RAG, and LangGraph. Nothing you type is kept.",
  icons: {
    icon: "/brand/favicon-32.png",
    apple: "/brand/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} font-sans antialiased`}>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
