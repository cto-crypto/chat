import { redirect } from "next/navigation";
import { getDemoSession } from "@/lib/demo-auth/session";
import { AppLayout } from "@/components/layout/app-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getDemoSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppLayout userEmail={user.email} userFullName={user.fullName}>
      {children}
    </AppLayout>
  );
}
