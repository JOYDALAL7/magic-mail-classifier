// /app/api/emails/route.ts

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerAuthSession } from "@/lib/auth";

// Helper to extract a specific header from Gmail API headers array
function getHeader(headers: { name: string; value: string }[], headerName: string) {
  const found = headers.find(h => h.name.toLowerCase() === headerName.toLowerCase());
  return found?.value || "";
}

// Helper to extract plain text body from message payload
function getPlainTextBody(payload: any): string {
  if (!payload) return "";
  // If the payload is plain text itself
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }
  // If multipart, find the plain text part
  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return Buffer.from(part.body.data, "base64").toString("utf-8");
      }
    }
  }
  return "";
}

export async function GET(req: NextRequest) {
  // Get user session and access token
  const session = await getServerAuthSession();
  const token = session?.access_token;

  if (!session || !token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get the "limit" query param (default 15)
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "15", 10);

  // Setup Gmail client with user's access token
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    // 1. List latest message IDs
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: limit,
      q: "",
    });

    const messages = listRes.data.messages || [];
    const emails: any[] = [];

    // 2. For each message, fetch minimal data: headers, snippet, body
    for (const msg of messages) {
      if (!msg.id) continue;
      const msgRes = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full", // To get headers and body
        metadataHeaders: ["Subject", "From", "Date"]
      });

      const payload = msgRes.data.payload;
      const headers = payload?.headers || [];

      emails.push({
        id: msg.id,
        subject: getHeader(headers, "Subject"),
        from: getHeader(headers, "From"),
        date: getHeader(headers, "Date"),
        snippet: msgRes.data.snippet || "",
        body: getPlainTextBody(payload),
      });
    }

    return NextResponse.json({ emails });
  } catch (err: any) {
    // Helpful error logging
    console.error("Failed to fetch Gmail messages", err);
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}
