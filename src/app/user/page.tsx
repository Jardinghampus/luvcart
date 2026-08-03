import { redirect } from "next/navigation";

/** Alias — admin directory lives at /demo */
export default function UserPage() {
  redirect("/demo");
}
