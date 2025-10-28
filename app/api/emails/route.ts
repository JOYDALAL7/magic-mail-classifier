import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "No access token" }), { status: 401 });
  }

  try {
    // 1. Get latest message IDs
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const list = await listRes.json();
    if (!list.messages) throw new Error("No messages found");

    // 2. Fetch details for each message
    const emails = await Promise.all(
      list.messages.map(async (msg: any) => {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const detail = await detailRes.json();
        const headers = detail.payload.headers;
        const getHeader = (name: string) =>
          headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
        return {
          id: msg.id,
          sender: getHeader("From"),
          subject: getHeader("Subject"),
          snippet: detail.snippet,
          date: getHeader("Date"),
        };
      })
    );

    return new Response(JSON.stringify({ emails }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Error fetching emails" }), { status: 500 });
  }
}
