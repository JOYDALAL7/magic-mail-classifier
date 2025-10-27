// /app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextRequest, NextResponse } from "next/server";

export const authOptions: NextAuthOptions = {
  // ... your providers, session, etc.

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.access_token = account.access_token;
        token.refresh_token = account.refresh_token;
        token.expires_at = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      // Add these 3 lines wrapped with (session as any)
      if (token) {
        (session as any).access_token = token.access_token;
        (session as any).refresh_token = token.refresh_token;
        (session as any).expires_at = token.expires_at;
      }
      return session;
    },
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
