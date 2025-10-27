import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // TODO: Use session to fetch Gmail emails!
    // For testing, return dummy emails:
    return NextResponse.json({
      emails: [
        {
          id: "test1",
          subject: "Demo Email",
          snippet: "This is a demo snippet.",
          body: "Full email body.",
          from: "test@example.com",
          date: new Date().toISOString(),
          category: "Unclassified"
        }
      ]
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}
