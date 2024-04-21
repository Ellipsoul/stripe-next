import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stripe for SaaS",
  description: "Basic application showing off Stripe metered billing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="prose p-12 text-center">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}

// Simple top nav bar
const Navbar = () => {
  return (
    <div className="navbar bg-base-100">
      {/* Title */}
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          🔥 Stripe for SaaS
        </Link>
      </div>
      {/* Home, Photos and Authentication Page */}
      <div className="flex-none menu menu-horizontal px-1">
        <Link href="/" className="btn">
          Home
        </Link>
        <Link href="/photos" className="btn mx-3">
          Photos
        </Link>
        <Link href="/user" className="btn">
          Authentication
        </Link>
      </div>
    </div>
  );
};
