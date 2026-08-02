import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AuthForm } from "@/components/AuthForm";
import { getSession } from "@/lib/auth";

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect("/my");

  return (
    <AppShell title="Join Luvcart" pathLabel="C:\\USERS\\NEW\\SETUP" loggedIn={false}>
      <AuthForm mode="signup" />
    </AppShell>
  );
}
