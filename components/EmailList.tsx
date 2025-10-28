import { useEffect, useState } from "react";

type Email = {
  id: string;
  subject: string;
  snippet: string;
  sender: string;
  date: string;
};

export default function EmailList({ onBack }: { onBack?: () => void }) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchEmails() {
      setLoading(true);
      const res = await fetch("/api/emails");
      const data = await res.json();
      setEmails(data.emails ?? []);
      setLoading(false);
    }
    fetchEmails();
  }, []);

  return (
    <div style={{
      maxWidth: 600,
      margin: "40px auto",
      color: "#fff"
    }}>
      <button
        onClick={onBack}
        style={{
          padding: "8px 18px",
          background: "#222",
          color: "#fff",
          border: "2px solid #555",
          borderRadius: 8,
          cursor: "pointer",
          marginBottom: 24,
          fontWeight: "bold"
        }}
      >
        ← Back to Main Menu
      </button>
      <h2 style={{ marginBottom: 18 }}>Your Latest Emails</h2>
      {loading && <div>Loading emails...</div>}
      <div>
        {emails.map((email, i) => (
          <div key={email.id} style={{
            background: "#16171c",
            marginBottom: 16,
            borderRadius: 8,
            padding: "18px 20px",
            boxShadow: "0 1px 6px #0003"
          }}>
            <div style={{ color: "#aaa", fontSize: "14px" }}>Email #{i + 1}</div>
            <div><strong>Subject:</strong> {email.subject || "(No subject)"}</div>
            <div><strong>From:</strong> {email.sender}</div>
            <div><strong>Date:</strong> {email.date}</div>
            <div style={{ marginTop: 8 }}>
              <strong>Snippet:</strong> <span style={{ color: "#7bc7ff" }}>{email.snippet}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
