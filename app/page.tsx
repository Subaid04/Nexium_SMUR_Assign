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
    <main className="min-h-screen p-8 bg-white text-black space-y-6">
      <h1 className="text-2xl font-bold">📝 Blog Summariser</h1>
      <div className="flex gap-4 max-w-xl">
        <Input
          placeholder="Paste blog URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Summarising..." : "Summarise"}
        </Button>
      </div>

      {summary && (
        <div className="mt-8 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Summary</h2>
            <p className="bg-slate-100 p-4 rounded">{summary}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Urdu Translation</h2>
            <p className="bg-green-50 p-4 rounded text-right font-urdu">
              {urdu}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
