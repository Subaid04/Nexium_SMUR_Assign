import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import dictionary from "@/lib/dictionary.json";
import supabase from "@/lib/supabase";
import { fulltexts } from "@/lib/mongodb";

// 🔁 Translate using dictionary
function translateToUrdu(text: string): string {
  return text
    .split(/\s+/)
    .map((word) => {
      const cleaned = word.toLowerCase().replace(/[.,!?;:()]/g, "");
      return (dictionary as Record<string, string>)[cleaned] || word;
    })
    .join(" ");
}

// 🌐 Scrape blog content
async function scrapeText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const content = $("article").text() || $("p").text();
    return content.replace(/\s+/g, " ").trim().slice(0, 3000);
  } catch (err) {
    console.error("Scrape error:", err);
    return "";
  }
}

// 🚀 POST handler
export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url || !url.startsWith("http")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const fullText = await scrapeText(url);
  if (!fullText) {
    return NextResponse.json({ error: "Content not found." }, { status: 500 });
  }

  const summary = fullText.split(". ").slice(0, 2).join(". ") + ".";
  const urdu = translateToUrdu(summary);

  // 💾 Save summary to Supabase
  const { error: supabaseError } = await supabase
    .from("summaries")
    .insert([{ url, summary, urdu }]);

  if (supabaseError) {
    console.error("❌ Supabase insert error:", supabaseError.message);
    return NextResponse.json(
      { error: "Failed to save to Supabase." },
      { status: 500 }
    );
  }

  // 💾 Save fullText to MongoDB
  try {
    await fulltexts.insertOne({
      url,
      fullText,
      createdAt: new Date(),
    });
  } catch (mongoError) {
    console.error("❌ MongoDB insert error:", mongoError);
    return NextResponse.json(
      { error: "Failed to save to MongoDB." },
      { status: 500 }
    );
  }

  return NextResponse.json({ summary, urdu });
}
