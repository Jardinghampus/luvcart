import type { Metadata, Viewport } from "next";
import { Nunito, Quicksand, Silkscreen, VT323 } from "next/font/google";
import { SpicyProvider } from "@/components/SpicyMode";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

const silk = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-silk",
});

const vt = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt",
});

export const metadata: Metadata = {
  title: "Luvcart",
  description: "Private polaroid folders. Incognito by default.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Luvcart",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#FFB7D5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${quicksand.variable} ${silk.variable} ${vt.variable}`}
    >
      <body>
        <SpicyProvider>{children}</SpicyProvider>
      </body>
    </html>
  );
}
