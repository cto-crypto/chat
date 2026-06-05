import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Attempt to load the profile for display name; gracefully fall back to auth user data
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("auth_user_id", user.id)
    .single();

  const userFullName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    undefined;

  const userEmail = profile?.email ?? user.email ?? undefined;

  return (
    <AppLayout userEmail={userEmail} userFullName={userFullName}>
      {children}
    </AppLayout>
  );
}
