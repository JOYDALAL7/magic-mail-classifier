import { NextResponse } from "next/server";

console.log('>>> [API] /api/emails/route.ts loaded');

export async function POST(req: Request) {
  console.log('>>> [API] /api/emails POST handler fired');
  try {
    return NextResponse.json({
      emails: [
        {
          id: "001",
          subject: "Dummy Email",
          snippet: "This is a test email for Fetch.",
          body: "Hello! This is a test email body.",
          from: "test@fetch.com",
          date: new Date().toISOString(),
          category: "Unclassified"
        }
      ]
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}
