import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR Order Kit",
  description: "Order from your table. The kitchen sees it live.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
