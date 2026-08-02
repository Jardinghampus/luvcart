import type { Metadata } from "next";
import { SlideshowVault } from "@/components/SlideshowVault";

export const metadata: Metadata = {
  title: "Vault · Luvcart",
  description: "Private Windows 94 slideshow of every Luvcart upload.",
  robots: { index: false, follow: false },
};

export default function SlideshowPage() {
  return <SlideshowVault />;
}
