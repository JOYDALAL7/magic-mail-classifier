"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();
  const [apiKey, setApiKey] = useState("");
  const [limit, setLimit] = useState(15);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-zinc-100 font-sans px-4 py-8 flex flex-col items-center">
      <header className="w-full max-w-2xl text-center mb-8">
        <h1 className="text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2">Magic Mail Classifier</h1>
        <p className="text-lg text-zinc-400 mb-3">Classify your Gmail inbox with AI in seconds</p>
      </header>
      <section className="w-full max-w-lg bg-zinc-900 rounded-xl shadow-lg p-7 mb-10 flex flex-col gap-5 border border-zinc-800">
        <div className="flex items-center justify-between">
          {session ? (
            <>
              <span className="text-xs text-zinc-300">Signed in as <span className="font-bold text-purple-400">{session.user?.email}</span></span>
              <button className="ml-2 text-xs px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition font-semibold" onClick={() => signOut()}>Sign out</button>
            </>
          ) : (
            <button className="w-full text-base px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 transition font-semibold" onClick={() => signIn("google")}>Sign in with Google</button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-400" htmlFor="api-key">OpenAI API key</label>
          <input
            id="api-key"
            className="w-full px-3 py-2 rounded bg-zinc-800 text-zinc-100 placeholder-zinc-500 border border-zinc-700"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-xs text-zinc-400" htmlFor="limit">Limit</label>
          <input
            id="limit"
            type="number"
            min={1}
            max={100}
            value={limit}
            className="w-16 px-2 py-1 rounded bg-zinc-800 text-zinc-100 border border-zinc-700"
            onChange={e => setLimit(Number(e.target.value))}
          />
          <button className="flex-1 text-base px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 transition font-semibold" onClick={() => {/* fetch logic */}}>Fetch</button>
          <button className="flex-1 text-base px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 transition font-semibold ml-2" onClick={() => {/* classify + fetch logic */}}>Fetch &amp; Classify</button>
        </div>
      </section>
      <section className="w-full max-w-2xl">
        {loading ? (
          <div className="flex items-center justify-center text-xl font-bold text-purple-400">Loading...</div>
        ) : emails.length === 0 ? (
          <div className="text-base text-zinc-400 text-center border border-zinc-800 rounded p-6">
            No emails loaded.<br />Click "Fetch" to load Gmail messages.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {emails.map((email, idx) => (
              <div key={email.id || idx} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 text-xs rounded bg-cyan-800 font-semibold text-white">{email.category ?? "Unclassified"}</span>
                  <span className="text-xs font-mono text-zinc-500">{email.id}</span>
                </div>
                <div className="font-bold text-lg mb-1 text-zinc-100">{email.subject}</div>
                <div className="text-zinc-400 text-sm">{email.snippet}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
