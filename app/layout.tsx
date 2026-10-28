import type { Metadata, Viewport } from "next";
import { Roboto_Slab, Work_Sans } from "next/font/google";
import "./globals.css";
import AppFrame from "./components/AppFrame";

const slab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-slab",
});

const work = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-work",
});

export const metadata: Metadata = {
  title: "Bahi Khata — Credit Ledger",
  description: "Manage customer credit and payments for your shop.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${slab.variable} ${work.variable} font-sans`}>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
