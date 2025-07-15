"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [urdu, setUrdu] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/summarise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setSummary(data.summary);
      setUrdu(data.urdu);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[--background] flex items-center justify-center px-4 py-20 font-sans">
      <div className="card-glass text-center">
        <h1 className="text-2xl font-bold mb-6">📝 Blog Summariser</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Paste a blog URL and get an instant summary with Urdu translation.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Paste blog URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Summarising..." : "Summarise"}
          </button>
        </form>

        {summary && (
          <div className="text-left space-y-6 mt-8">
            <div>
              <h2 className="text-lg font-semibold text-[--foreground]">
                Summary
              </h2>
              <p className="bg-white text-[--foreground] p-4 rounded-xl shadow">
                {summary}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[--foreground]">
                اردو ترجمہ
              </h2>
              <p className="bg-[#e5fbee] text-green-900 p-4 rounded-xl text-right">
                {urdu}
              </p>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground mt-6">
          Built with ❤️ using Next.js, TailwindCSS & Supabase
        </p>
      </div>
    </main>
  );
}
