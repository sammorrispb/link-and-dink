import type { Metadata } from "next";
import { Outfit, Geist } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.SITE_URL ?? "https://www.linkanddink.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Link & Dink — Play up.",
  description:
    "Matched games and curated groups across the DMV. For players who've outgrown open play. Powered by JOOLA.",
  icons: {
    icon: {
      url:
        "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' fill='none'><rect width='40' height='40' rx='9' fill='%23044026'/><g transform='rotate(-22 20 26)'><ellipse cx='13' cy='18' rx='7' ry='8.5' fill='%23CAF368'/><rect x='10.5' y='24' width='5' height='11' rx='1.8' fill='%23CAF368'/></g><g transform='rotate(22 20 26)'><ellipse cx='27' cy='18' rx='7' ry='8.5' fill='%23CAF368'/><rect x='24.5' y='24' width='5' height='11' rx='1.8' fill='%23CAF368'/></g><circle cx='20' cy='9' r='5' fill='%23fffdfa'/></svg>",
      type: "image/svg+xml",
    },
  },
  openGraph: {
    title: "Link & Dink — Play up.",
    description:
      "Matched games and curated groups across the DMV. For players who've outgrown open play. Powered by JOOLA.",
    url: SITE_URL,
    siteName: "Link & Dink",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${geist.variable}`}>
      <body>{children}</body>
    </html>
  );
}
