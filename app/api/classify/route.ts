import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Email type may be defined elsewhere
interface Email {
  id: string;
  subject: string;
  snippet: string;
  body: string;
  from: string;
  date: string;
  category?: string;
}

const CATEGORIES = [
  "Important",
  "Promotions",
  "Social",
  "Marketing",
  "Spam",
  "General",
];

function buildPrompt(batch: Email[]): string {
  return `
You are an email classification assistant. Given the following emails, classify each one into the most appropriate category from: Important, Promotions, Social, Marketing, Spam, General.

For each email, use the fields: id, subject, snippet, and body.

Respond ONLY with a valid JSON array of objects in this format:
[
  { "id": "<email_id>", "category": "<category>" },
  ...
]
Emails:
${JSON.stringify(batch)}
`;
}

export async function POST(req: NextRequest) {
  const { apiKey, emails } = await req.json();
  const openai = new OpenAI({ apiKey });

  const prompt = buildPrompt(emails);

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "system", content: prompt }],
    max_tokens: 512,
    temperature: 0.2,
  });

  // Extract assistant reply, parse to JSON, and send back
  const content = completion.choices[0]?.message?.content?.trim() || "[]";
  let categories: any[] = [];
  try {
    categories = JSON.parse(content);
  } catch {
    categories = [];
  }

  return NextResponse.json({ categories });
}
