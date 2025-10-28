import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { Account, Session } from "next-auth";

// ============================
// AUTH CONFIGURATION
// ============================
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
        },
      },
    }),
  ],

  callbacks: {
    // 🔹 Handle JWT (stores access token)
    async jwt({
      token,
      account,
    }: {
      token: JWT;
      account?: Account | null;
    }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    // 🔹 Attach token to session
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET as string,
};

// ============================
// HANDLER (for App Router)
// ============================
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
