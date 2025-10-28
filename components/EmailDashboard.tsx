import { useState, useEffect } from 'react';

type Email = {
  id: string;
  subject: string;
  snippet: string;
  sender: string;
  date: string;
  category: string;
};

const CATEGORY_MAP = {
  important: "text-green-500 border-green-400",
  promotional: "text-orange-500 border-orange-400",
  social: "text-blue-500 border-blue-400",
  marketing: "text-cyan-600 border-cyan-400",
  spam: "text-red-500 border-red-400"
};

export default function EmailDashboard({
  user,
  onLogout
}: {
  user: { name: string; email: string; image?: string };
  onLogout: () => void;
}) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [classifying, setClassifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setApiKey(localStorage.getItem("openai_key") || "");
    const local = localStorage.getItem("emails");
    if (local) setEmails(JSON.parse(local));
  }, []);

  async function fetchAndClassify() {
    setError(null);
    setClassifying(true);
    try {
      const res = await fetch("/api/emails");
      if (!res.ok) throw new Error("Email fetch failed");
      const { emails: fetchedEmails } = await res.json();
      const classified = await Promise.all(
        fetchedEmails.map(async (email: any) => {
          const resp = await fetch("/api/classify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subject: email.subject,
              snippet: email.snippet,
              apiKey
            })
          });
          if (!resp.ok) throw new Error("Classification failed");
          const { category } = await resp.json();
          return { ...email, category };
        })
      );
      setEmails(classified);
      localStorage.setItem("emails", JSON.stringify(classified));
    } catch (e) {
      setError("Problem fetching or classifying emails.");
    } finally {
      setClassifying(false);
    }
  }

  function handleKeyChange(e: React.ChangeEvent<HTMLInputElement>) {
    setApiKey(e.target.value);
    localStorage.setItem("openai_key", e.target.value);
  }

  const selected = emails.find(e => e.id === selectedId);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-2xl flex w-full max-w-5xl overflow-hidden">
        {/* Sidebar */}
        <div className="w-[330px] border-r border-gray-200 flex flex-col items-center py-10">
          <img
            src={user.image || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=0D8ABC&color=fff&size=120`}
            className="rounded-full w-[80px] h-[80px] mb-4"
            alt="Profile"
          />
          <div className="text-lg font-bold">{user.name}</div>
          <div className="text-gray-400 text-xs mb-2">{user.email}</div>
          <button onClick={onLogout} className="bg-gray-200 text-gray-700 rounded mx-2 px-4 py-2 mb-8">
            Logout
          </button>
          <div className="w-full px-6">
            <div className="font-semibold mb-2">OpenAI API key:</div>
            <input
              className="w-full p-2 border rounded text-xs"
              placeholder="sk-..."
              value={apiKey}
              onChange={handleKeyChange}
            />
            <button
              onClick={fetchAndClassify}
              disabled={classifying}
              className="bg-sky-800 mt-4 w-full rounded text-white p-2 flex justify-center hover:scale-[1.03] transition"
            >
              {classifying ? "Loading..." : "Fetch & Classify Emails"}
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </div>
        </div>
        {/* Main content */}
        <div className="flex-1 p-10">
          <div className="flex justify-between items-center mb-8">
            <div className="text-xl font-bold">Categorized Inbox</div>
          </div>
          <div className="space-y-5">
            {["important", "promotional", "social", "marketing", "spam"].map(cat => (
              <div key={cat}>
                <div className={`font-semibold mb-3 capitalize ${CATEGORY_MAP[cat as keyof typeof CATEGORY_MAP]}`}>{cat}</div>
                {emails.filter(email => email.category === cat).map(email => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedId(email.id)}
                    className={`border rounded-lg px-6 py-5 bg-white mb-2 cursor-pointer transition-shadow hover:shadow-lg ${CATEGORY_MAP[cat as keyof typeof CATEGORY_MAP] || ""} border-2 ${selectedId === email.id ? "bg-gray-50" : ""}`}
                  >
                    <div className="flex justify-between">
                      <div className="font-bold text-gray-800">{email.subject}</div>
                      <div className="text-xs capitalize">{email.category || ""}</div>
                    </div>
                    <div className="text-[13px] text-gray-500">{email.snippet}</div>
                    <div className="flex justify-between mt-3 text-xs text-gray-400">
                      <span>{email.sender}</span>
                      <span>{email.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Right side preview pane */}
        {selected && (
          <div className="w-[410px] bg-gray-50 p-8 border-l border-gray-200 flex flex-col">
            <div className={`capitalize mb-4 font-bold ${CATEGORY_MAP[selected.category as keyof typeof CATEGORY_MAP]}`}>
              {selected.category}
            </div>
            <div className="font-bold mb-2">{selected.subject}</div>
            <div className="mb-6 text-sm text-gray-700">{selected.snippet}</div>
            <div className="text-xs text-gray-500">From: {selected.sender}</div>
            <div className="text-xs text-gray-400 mt-2">{selected.date}</div>
          </div>
        )}
      </div>
    </div>
  );
}
