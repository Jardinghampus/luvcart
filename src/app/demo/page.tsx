import type { Metadata } from "next";
import { DemoDirectory } from "@/components/DemoDirectory";

export const metadata: Metadata = {
  title: "Demo · Luvcart",
  description: "Private directory of Luvcart users.",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return <DemoDirectory />;
}
