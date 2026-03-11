import { auth } from "@/auth";

export async function getTenantContext() {
  const session = await auth();
  // Cast session.user to any to access the organizationId we'll add
  const user = session?.user as any;

  if (!user || (!user.organizationId && user.role !== "SUPERADMIN")) {
    throw new Error("Unauthorized: No tenant context found");
  }

  return {
    userId: user.id || user.email,
    organizationId: user.organizationId,
    role: user.role,
  };
}
