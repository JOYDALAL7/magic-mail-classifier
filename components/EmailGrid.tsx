import React, { useState } from "react";
import { Mail, LogOut, Loader2 } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function EmailGrid({
  user,
  accessToken,
  onLogout,
}: {
  user: { name: string; email: string; image: string };
  accessToken: string;
  onLogout: () => void;
}) {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchEmails() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setEmails(res.data.emails || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to fetch emails");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="rounded-3xl bg-gradient-to-br from-[#23232e]/70 to-[#232329]/40 backdrop-blur shadow-xl p-8">
          {/* Profile Card/Header */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={user.image}
              alt="profile"
              className="w-20 h-20 rounded-full object-cover border-4 border-white/20 shadow-xl mb-3"
            />
            <div className="text-xl font-bold text-white">{user.name}</div>
            <div className="text-gray-400 text-sm">{user.email}</div>
            <button
              onClick={onLogout}
              className="mt-3 flex items-center gap-2 px-4 py-1 font-medium rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 border border-white/10 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Fetch Button + State */}
          {!emails.length ? (
            <div className="flex flex-col items-center my-10">
              <button
                onClick={fetchEmails}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 text-lg font-semibold rounded-xl bg-gradient-to-br from-sky-800 to-cyan-500 shadow-lg text-white hover:scale-105 transition focus:ring-2 ring-cyan-600"
              >
                <Mail className="w-5 h-5" />
                {loading ? "Fetching your inbox…" : "Fetch Emails"}
              </button>
              {loading && (
                <div className="mt-8 w-full space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-gray-800/60 rounded-2xl h-20 w-full"
                    />
                  ))}
                </div>
              )}
              {error && (
                <div className="mt-6 bg-red-900 text-red-200 p-3 rounded-xl shadow">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
              }}
              className="overflow-y-auto max-h-[420px] space-y-5 pt-2"
            >
              {emails.map((email, idx) => (
                <motion.div
                  key={email.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white/10 border border-white/10 hover:border-cyan-500 shadow-lg rounded-2xl p-5 transition-transform hover:scale-[1.025] cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-semibold text-white truncate">{email.sender}</div>
                    <div className="text-xs text-gray-400">{email.date}</div>
                  </div>
                  <div className="font-bold text-cyan-300 mb-2">{email.subject}</div>
                  <div className="text-sm text-gray-300 line-clamp-2">{email.snippet}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
