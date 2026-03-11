import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/SidebarProvider";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as any;

  return (
    <SidebarProvider>
      <AppLayoutWrapper user={user}>
        {children}
      </AppLayoutWrapper>
    </SidebarProvider>
  );
}
