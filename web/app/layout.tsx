import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cryptography Museum | 3D Digital Archive",
  description: "A living 3D digital museum of secret writing powered by WebGL, React Three Fiber, and FastAPI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-stone-950 text-stone-100 font-sans antialiased selection:bg-amber-500 selection:text-stone-950">
        {children}
      </body>
    </html>
  );
}
