// /components/OpenAIKeyInput.tsx

"use client";
import { useState, useEffect } from "react";

export default function OpenAIKeyInput() {
  const [input, setInput] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const key = localStorage.getItem("openai_api_key");
    setSavedKey(key ?? null);
    setInput(key ?? "");
  }, []);

  function handleSave() {
    localStorage.setItem("openai_api_key", input);
    setSavedKey(input);
    setToast("API key saved!");
    setTimeout(() => setToast(""), 2000);
  }

  function handleRemove() {
    localStorage.removeItem("openai_api_key");
    setSavedKey(null);
    setInput("");
    setToast("API key removed!");
    setTimeout(() => setToast(""), 2000);
  }

  return (
    <div className="w-full max-w-md bg-white shadow rounded p-4 flex flex-col gap-3">
      <label className="font-semibold text-sm mb-1">
        OpenAI API Key
      </label>
      <input
        type="password"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="sk-..."
        className="px-3 py-2 border rounded text-sm w-full"
      />
      <div className="flex gap-2 mt-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          disabled={!input || input === savedKey}
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 disabled:bg-gray-100"
          disabled={!savedKey}
          onClick={handleRemove}
        >
          Remove
        </button>
      </div>
      {toast && (
        <div className="mt-2 text-green-700 bg-green-100 rounded px-3 py-1 text-sm transition">
          {toast}
        </div>
      )}
      <div className="mt-1 text-xs text-gray-400">
        Your API key is stored only in your browser. It will <b>not</b> be sent anywhere except to the classification API when needed.
      </div>
    </div>
  );
}
