import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Power Word Detection - Caption Generator",
  description: "Auto captioning with power word detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
