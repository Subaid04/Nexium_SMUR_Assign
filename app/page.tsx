"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [urdu, setUrdu] = useState("");

  async function handleSubmit() {
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
    <main className="min-h-screen flex items-center justify-center bg-[--background] text-[--foreground] px-4 font-sans">
      <div className="w-full max-w-xl bg-[#f7efe2] p-8 rounded-2xl shadow-lg border border-[#ebdfc8] space-y-6 text-center">
        <h1 className="text-3xl font-semibold">📝 Blog Summariser</h1>
        <p className="text-[--muted-foreground] text-sm">
          Paste a blog URL and get an instant summary with Urdu translation.
        </p>

        <div className="flex flex-col gap-4 mt-4">
          <Input
            className="bg-white text-[--foreground] placeholder:text-gray-400 border-gray-300"
            placeholder="Paste blog URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[--accent] text-[--foreground] hover:bg-yellow-400 transition-all"
          >
            {loading ? "Summarising..." : "Summarise"}
          </Button>
        </div>

        {summary && (
          <div className="text-left space-y-6 mt-6">
            <div>
              <h2 className="text-lg font-semibold">Summary</h2>
              <p className="bg-white text-black p-4 rounded-xl border border-gray-200">
                {summary}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">اردو ترجمہ</h2>
              <p className="bg-green-100 text-right p-4 rounded-xl font-urdu">
                {urdu}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-[--muted-foreground] mt-6 text-center">
        Built with ❤️ using Next.js, TailwindCSS & Supabase
      </p>
    </main>
  );
}
