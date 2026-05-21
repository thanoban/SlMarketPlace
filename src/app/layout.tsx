import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "SL Events — Discover Events in Sri Lanka",
  description:
    "Find events and workshops across Sri Lanka matched to your interests — tech, medicine, business, arts, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans`}>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
