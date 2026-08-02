import type { Metadata } from "next";
import { SlideshowVault } from "@/components/SlideshowVault";
import "./slideshow.css";

export const metadata: Metadata = {
  title: "Slideshow Vault · Luvcart",
  description: "Private Windows 94 slideshow of every Luvcart upload.",
};

export default function SlideshowPage() {
  return <SlideshowVault />;
}
