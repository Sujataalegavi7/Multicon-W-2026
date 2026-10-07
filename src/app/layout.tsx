import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const base = process.env.APP_URL ?? "http://localhost";

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: { default: "TCET Conference Research Repository", template: "%s · TCET CRR" },
  description: "Open-access digital library of peer-reviewed MULTICON-W conference publications from Thakur College of Engineering & Technology.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=Inter:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
