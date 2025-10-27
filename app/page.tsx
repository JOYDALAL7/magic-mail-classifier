// /app/page.tsx

"use client";
import React, { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

// ...other imports

type Email = {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  body: string;
  category?: string;
};

type GroupedEmails = {
  [category: string]: Email[];
};

export default function DashboardPage() {
  const { data: session, status } = useSession();

  // OpenAI API key handled locally
  const [apiKey, setApiKey] = useState("");
  const [limit, setLimit] = useState(15);
  const [emails, setEmails] = useState<Email[]>([]);
  const [grouped, setGrouped] = useState<GroupedEmails>({});
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load apiKey and emails from localStorage on mount
  useEffect(() => {
    setApiKey(localStorage.getItem("openai_api_key") || "");
    try {
      const emailsLocal = localStorage.getItem("emails");
      if (emailsLocal) setEmails(JSON.parse(emailsLocal));
    } catch { /* ignore */ }
  }, []);

  // Group emails by category after classification
  useEffect(() => {
    const groupedResult: GroupedEmails = {};
    emails.forEach(email => {
      const cat = email.category || "uncategorized";
      if (!groupedResult[cat]) groupedResult[cat] = [];
      groupedResult[cat].push(email);
    });
    setGrouped(groupedResult);
  }, [emails]);

  // Save API key to localStorage on change
  function handleApiKeyChange(e: React.ChangeEvent<HTMLInputElement>) {
    setApiKey(e.target.value);
    localStorage.setItem("openai_api_key", e.target.value);
  }

  function handleLimitChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLimit(Number(e.target.value));
  }

  // Fetch emails from API
  async function fetchEmails() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/emails?limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch emails");
      const { emails } = await res.json();
      setEmails(emails);
      localStorage.setItem("emails", JSON.stringify(emails));
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  // Post to classify endpoint
  async function classifyEmails() {
    setProcessing(true);
    setError(null);
    try {
      if (!apiKey) throw new Error("Please set your OpenAI API key.");
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, openai_api_key: apiKey })
      });
      if (!res.ok) throw new Error("Failed to classify emails");
      const { categorized } = await res.json();
      setEmails(categorized);
      localStorage.setItem("emails", JSON.stringify(categorized));
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setProcessing(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen text-lg">Loading...</div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6">
        <h2 className="text-2xl font-bold">Magic Mail Classifier</h2>
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => signIn("google")}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold">Signed in as <span className="text-blue-700">{session.user?.email}</span></span>
          <button className="text-sm text-red-500" onClick={() => signOut()}>Sign out</button>
        </div>
        <div className="flex gap-3 items-end mb-5">
          <div>
            <label className="block text-xs font-semibold mb-1">OpenAI API key</label>
            <input
              type="password"
              value={apiKey}
              onChange={handleApiKeyChange}
              className="w-52 px-3 py-1 border rounded"
              placeholder="sk-..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Limit</label>
            <input
              type="number"
              value={limit}
              min={1}
              max={50}
              onChange={handleLimitChange}
              className="w-20 px-3 py-1 border rounded"
            />
          </div>
          <button
            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:bg-blue-300"
            onClick={fetchEmails}
            disabled={loading || processing}
          >
            {loading ? "Fetching..." : "Fetch"}
          </button>
          <button
            className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 disabled:bg-green-300"
            onClick={classifyEmails}
            disabled={processing || emails.length === 0}
          >
            {processing ? "Classifying..." : "Fetch & Classify"}
          </button>
        </div>
        {error && (
          <div className="bg-red-100 text-red-600 rounded p-2 mb-4">{error}</div>
        )}

        {/* EMAILS */}
        {Object.keys(grouped).length > 0 ? (
          <div className="mt-8 space-y-8">
            {Object.keys(grouped).map(cat => (
              <div key={cat}>
                <h3 className="text-lg font-bold mb-2 capitalize">{cat}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {grouped[cat].map(email => (
                    <div key={email.id} className="bg-gray-50 rounded shadow p-3 border">
                      <div className="text-xs mb-1 text-gray-600">{email.from} — {email.date}</div>
                      <div className="font-semibold mb-1">{email.subject || "(No subject)"}</div>
                      <div className="text-xs mb-1 text-gray-600">{email.snippet}</div>
                      <pre className="text-xs text-gray-800 mt-1 whitespace-pre-wrap">{email.body}</pre>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 text-gray-400 text-center">
            No emails loaded. Click "Fetch" to load Gmail messages.
          </div>
        )}
      </div>
    </div>
  );
}
