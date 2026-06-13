import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cryptography Museum",
  description: "A comprehensive museum and suite of cryptographic algorithms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b border-gray-800 bg-gray-950/50 py-4 backdrop-blur">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <h1 className="text-xl font-bold tracking-tight text-white">
              🔒 Cryptography Museum
            </h1>
            <nav className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition">Classical</a>
              <a href="#" className="hover:text-white transition">Historical</a>
              <a href="#" className="hover:text-white transition">Modern</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-gray-900 bg-black/80 py-6 mt-12 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Cryptography Museum. Educational tool only.</p>
        </footer>
      </body>
    </html>
  );
}
