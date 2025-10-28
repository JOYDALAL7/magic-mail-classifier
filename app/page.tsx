"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import EmailGrid from "@/components/EmailGrid";

export default function Page() {
  const { data: session, status } = useSession();

  if (status === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );

  if (!session)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <button
          onClick={() => signIn("google")}
          className="px-8 py-4 bg-cyan-600 text-white font-extrabold rounded-xl shadow-lg"
        >
          Sign in with Google
        </button>
      </div>
    );

  // Use type assertion or optional chaining with fallback since accessToken is not on Session type by default
  const accessToken = (session as any)?.accessToken ?? "";

  return (
    <EmailGrid
      user={{
        name: session.user?.name ?? "",
        email: session.user?.email ?? "",
        image: session.user?.image ?? "",
      }}
      accessToken={accessToken}
      onLogout={() => signOut()}
    />
  );
}
