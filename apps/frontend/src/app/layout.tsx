import type { Metadata } from "next";
import { Permanent_Marker, Space_Mono } from "next/font/google";
import "./globals.css";

const marker = Permanent_Marker({
  weight: "400",
  variable: "--font-marker",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MockBack — AI Mock Server",
  description:
    "Describe an API in plain English. Get a live, shareable mock server in under a minute.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${marker.variable} ${spaceMono.variable}`}>
      <body>
        {/* Grain overlay for the whole app */}
        <div className="grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
