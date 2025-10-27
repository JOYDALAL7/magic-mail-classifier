// /lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Helper to get the NextAuth session in server components/routes.
 * Usage: const session = await getServerAuthSession();
 */
export function getServerAuthSession() {
  return getServerSession(authOptions);
}
