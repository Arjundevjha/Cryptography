import type { Metadata } from "next";
import { Cinzel, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cryptography Museum | 3D Digital Archive",
  description: "A living 3D archival museum of secret writing, cryptographic breakthroughs, and mathematical history.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${cinzel.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#090b10] text-stone-100 font-sans antialiased selection:bg-amber-500/30 selection:text-amber-100">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

