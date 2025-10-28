import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  // Fetch the NextAuth session (type-safe)
  const session = await getServerSession(authOptions);

  // Use type assertion to get accessToken, as it isn't in Session type by default
  const accessToken = (session as any)?.accessToken as string | undefined;

  if (!accessToken) {
    return new Response(
      JSON.stringify({ error: "No access token found in session" }),
      { status: 401 }
    );
  }

  try {
    // List the latest 10 messages
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const list = await listRes.json();

    if (!list.messages) {
      return new Response(
        JSON.stringify({ emails: [], message: "No messages found" }),
        { status: 200 }
      );
    }

    // Fetch message details concurrently
    const emails = await Promise.all(
      list.messages.map(async (msg: any) => {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const detail = await detailRes.json();

        const headers = detail.payload.headers;
        const getHeader = (name: string) =>
          headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())
            ?.value ?? "";

        return {
          id: detail.id,
          sender: getHeader("From"),
          subject: getHeader("Subject"),
          snippet: detail.snippet,
          date: getHeader("Date"),
        };
      })
    );

    return new Response(JSON.stringify({ emails }), { status: 200 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Failed to fetch emails" }),
      { status: 500 }
    );
  }
}
