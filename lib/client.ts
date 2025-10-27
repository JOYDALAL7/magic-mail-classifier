// /lib/client.ts

export type Email = {
  id: string;
  subject: string;
  snippet: string;
  body: string;
  from: string;
  date: string;
};

export type ClassifiedEmail = Email & {
  category: string;
};

// Fetch emails from the API
export async function fetchEmails(limit: number = 15): Promise<Email[]> {
  const res = await fetch(`/api/emails?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch emails");
  const data = await res.json();
  return data.emails as Email[];
}

// Classify emails using OpenAI (server endpoint)
export async function classifyEmails(emails: Email[], apiKey: string): Promise<ClassifiedEmail[]> {
  const res = await fetch("/api/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emails, apiKey }),
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Failed to classify emails");
  }
  const data = await res.json();
  return data.classified as ClassifiedEmail[];
}
