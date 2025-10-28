import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { subject, snippet, apiKey } = await req.json();

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OpenAI API key required" }), { status: 400 });
  }

  const prompt = `Classify the following email into one of: important, promotional, social, marketing, spam. Only output the category.
Subject: ${subject}
Snippet: ${snippet}`;

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a smart email classifier." },
        { role: "user", content: prompt }
      ],
      max_tokens: 10
    })
  });

  const data = await resp.json();

  const category = data?.choices?.[0]?.message?.content?.trim().toLowerCase().split("\n")[0] ?? "other";
  return new Response(JSON.stringify({ category }), { status: 200 });
}
