// /components/EmailGrid.tsx

"use client";
import React from "react";
import type { ClassifiedEmail } from "@/lib/client";

type Props = {
  classifiedEmails: ClassifiedEmail[];
};

export default function EmailGrid({ classifiedEmails }: Props) {
  // Group emails by category
  const grouped = classifiedEmails.reduce<Record<string, ClassifiedEmail[]>>(
    (acc, email) => {
      const cat = email.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(email);
      return acc;
    },
    {}
  );

  const badgeColors: Record<string, string> = {
    Important: "bg-red-500 text-white",
    Promotions: "bg-green-500 text-white",
    Social: "bg-blue-500 text-white",
    Marketing: "bg-purple-500 text-white",
    Spam: "bg-gray-500 text-white",
    General: "bg-yellow-400 text-black",
  };

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(grouped).map(([category, emails]) => (
          <div key={category} className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold mb-3 capitalize border-b border-gray-300 pb-1">
              {category} ({emails.length})
            </h3>
            {emails.map((email) => (
              <div
                key={email.id}
                className="border rounded-md p-4 shadow-sm hover:shadow-md transition cursor-pointer bg-white"
                title={email.subject}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${badgeColors[category] || badgeColors.General}`}
                  >
                    {category}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {new Date(email.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="font-semibold mb-1 truncate">{email.subject || "(No Subject)"}</div>
                <div className="text-sm text-gray-700 mb-1 truncate">{email.from}</div>
                <div className="text-sm text-gray-600 truncate">{email.snippet}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
