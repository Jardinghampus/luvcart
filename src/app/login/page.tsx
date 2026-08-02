import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AuthForm } from "@/components/AuthForm";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/my");

  return (
    <AppShell title="Login" pathLabel="C:\\USERS\\GIRL\\LOGIN" loggedIn={false}>
      <AuthForm mode="login" />
    </AppShell>
  );
}
