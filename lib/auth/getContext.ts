import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getTenantContext() {
  const session = await auth();
  const sessionUser = session?.user as any;

  if (!sessionUser?.email) {
    throw new Error("Unauthorized: Please log in again");
  }

  // Fetch the latest user data from DB to get the current organizationId
  // This avoids issues with stale session tokens after database resets/reseeds
  const user = await prisma.user.findUnique({
    where: { email: sessionUser.email },
    select: { id: true, organizationId: true, role: true }
  });

  if (!user) {
    throw new Error("Unauthorized: User not found in database");
  }

  if (!user.organizationId && user.role !== "SUPERADMIN") {
    throw new Error("Unauthorized: Your account is not associated with any organization");
  }

  return {
    userId: user.id,
    organizationId: user.organizationId as string,
    role: user.role,
  };
}
