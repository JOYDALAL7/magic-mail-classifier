// app/api/classify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenAIApi, Configuration } from "openai";

// Email type definition
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

// Helper: Build classification prompt for a batch
function buildPrompt(batch: Email[]): string {
  return `
You are an email classification assistant. Given the following emails, classify each one into exactly one of these categories: Important, Promotions, Social, Marketing, Spam, General.

For each email, use the fields: id, subject, snippet, and body.

Respond ONLY with a valid JSON array of objects in this format:
[
  { "id": "<email_id>", "category": "<category>" },
  ...
]

No extra text, explanation, or formatting outside this JSON.

Categories are defined as:
- Important: Emails requiring urgent or high-priority attention, e.g., from known contacts or about critical issues.
- Promotions: Emails advertising products, sales, or discounts.
- Social: Emails related to social media notifications, friend requests, or events.
- Marketing: Marketing messages not falling under promotions, e.g., newsletters, branded content.
- Spam: Unsolicited and irrelevant emails, scams, or phishing attempts.
- General: All other emails not fitting above categories.

If unsure, prefer General.

Keep your response as short as possible and avoid hallucination.

Emails:
${batch
    .map(
      (email, i) =>
        `Email ${i + 1}:
id: ${email.id}
Subject: ${email.subject}
Snippet: ${email.snippet}
Body: ${email.body ? email.body.slice(0, 1000) : ""}`
    )
    .join("\n")}
`;
}

const BATCH_SIZE = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey: string = body.apiKey ?? body.openai_api_key;
    const emails: Email[] = body.emails;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OpenAI API key" },
        { status: 400 }
      );
    }
    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "No emails provided" }, { status: 400 });
    }

    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    const classifiedMap = new Map<string, string>();

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      const prompt = buildPrompt(batch);

      let response;
      try {
        response = await openai.createChatCompletion({
          // Use "gpt-4o" by default, switch to "gpt-4o-mini" if needed
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a precise and concise AI classifier. Return only the pure JSON array. No explanation.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0,
          max_tokens: 700,
        });
      } catch (err: any) {
        // fallback to gpt-4o-mini if model not found
        if (
          err?.response?.data?.error?.code === "model_not_found" ||
          err?.response?.data?.error?.message?.includes("model")
        ) {
          response = await openai.createChatCompletion({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a precise and concise AI classifier. Return only the pure JSON array. No explanation.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0,
            max_tokens: 700,
          });
        } else {
          throw err;
        }
      }

      const text = response?.data.choices?.[0]?.message?.content || "[]";
      let results: { id: string; category: string }[] = [];

      // Robust parsing for JSON array even with some extra text
      try {
        results = JSON.parse(text);
      } catch {
        const arrMatch = text.match(/\[[\s\S]*\]/);
        if (arrMatch) {
          results = JSON.parse(arrMatch[0]);
        }
      }
      for (const c of results) {
        if (c.id && c.category) classifiedMap.set(c.id, c.category);
      }
    }

    // Merge categories into emails
    const output = emails.map((e) => ({
      ...e,
      category: classifiedMap.get(e.id) || "General",
    }));

    return NextResponse.json({ classified: output });
  } catch (err: any) {
    console.error("AI classification error:", err);
    return NextResponse.json(
      {
        error: err?.message || "Failed to classify emails",
        detail: err?.response?.data || undefined,
      },
      { status: 500 }
    );
  }
}
