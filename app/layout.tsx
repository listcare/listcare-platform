import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ListCare — Ό,τι χρειάζεται το κατάλυμά σου",
  description: "Απλά εργαλεία για καταχωρήσεις, φωτογραφίες, τιμές και κριτικές καταλυμάτων."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="el">
      <body>
        <header className="topbar">
          <Link className="brand" href="/dashboard"><span>L</span>ListCare</Link>
          <nav>
            <Link href="/dashboard">Εργαλεία</Link>
            <Link href="/properties">Τα καταλύματά μου</Link>
            <Link href="/credits">Credits</Link>
          </nav>
          <div className="credit-pill">● <b>6</b> credits</div>
        </header>
        {children}
      </body>
    </html>
  );
}
