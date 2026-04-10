import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Instrument_Serif, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "700"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["400", "500"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  weight: ["300", "400", "500", "700"],
  preload: false,
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  variable: "--font-noto-serif-sc",
  weight: ["400", "500", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "ariawiki.com — Personal AI Learning Library",
  description: "A personal AI learning library tracking papers, tech blogs, products, and quick insights about artificial intelligence.",
  openGraph: {
    title: "ariawiki.com",
    description: "A personal AI learning library",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${dmMono.variable} ${instrumentSerif.variable} ${notoSansSC.variable} ${notoSerifSC.variable} font-sans bg-offwhite min-h-screen`}
        style={{ cursor: "none" }}
      >
        {children}
      </body>
    </html>
  );
}
