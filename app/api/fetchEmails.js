import { useEffect, useState } from "react";

type Email = {
  id: string;
  subject: string;
  snippet: string;
  sender: string;
  date: string;
};

export default function EmailList() {
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

  if (loading) return <div>Loading emails...</div>;

  return (
    <ul>
      {emails.map((email) => (
        <li key={email.id} style={{ marginBottom: "1rem" }}>
          <strong>Subject:</strong> {email.subject}<br />
          <strong>From:</strong> {email.sender}<br />
          <strong>Date:</strong> {email.date}<br />
          <strong>Snippet:</strong> {email.snippet}
        </li>
      ))}
    </ul>
  );
}
