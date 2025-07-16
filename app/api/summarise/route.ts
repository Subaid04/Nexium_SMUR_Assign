// assignment-2/app/api/summarise/route.ts

import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import dictionary from "@/lib/dictionary.json";
import supabase from "@/lib/supabase";
import { fulltexts } from "@/lib/mongodb";

// 👇 Ensure Vercel uses Node.js runtime (not Edge)
export const runtime = "nodejs";

// 🈯 Translate using dictionary
function translateToUrdu(text: string): string {
  return text
    .split(/\s+/)
    .map((word) => {
      const cleaned = word.toLowerCase().replace(/[.,!?;:()]/g, "");
      return (dictionary as Record<string, string>)[cleaned] || word;
    })
    .join(" ");
}

// 🕷 Scrape blog content
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
    console.error("❌ Scrape error:", err);
    return "";
  }
}

// 🚀 POST handler
export async function POST(req: NextRequest) {
  console.log("✅ API HIT: /api/summarise");

  let url: string;
  try {
    const body = await req.json();
    url = body.url;
    console.log("📥 URL received:", url);
  } catch (err) {
    console.error("❌ Error parsing request JSON:", err);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!url || !url.startsWith("http")) {
    console.log("❌ Invalid URL:", url);
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const fullText = await scrapeText(url);
  console.log("📄 Scraped text length:", fullText.length);

  if (!fullText) {
    console.log("❌ Failed to scrape any content from:", url);
    return NextResponse.json({ error: "Content not found." }, { status: 500 });
  }

  const summary = fullText.split(". ").slice(0, 2).join(". ") + ".";
  const urdu = translateToUrdu(summary);
  console.log("📝 Summary and Urdu translation prepared");

  // Save to Supabase
  try {
    const { error: supabaseError } = await supabase
      .from("summaries")
      .insert([{ url, summary, urdu }]);

    if (supabaseError) {
      console.error("❌ Supabase insert error:", supabaseError.message);
      throw new Error(supabaseError.message);
    }

    console.log("✅ Summary saved to Supabase");
  } catch (err) {
    console.error("❌ Supabase insert failure:", err);
    return NextResponse.json(
      { error: "Failed to save to Supabase." },
      { status: 500 }
    );
  }

  // Save to MongoDB
  try {
    await fulltexts.insertOne({
      url,
      fullText,
      createdAt: new Date(),
    });

    console.log("✅ Full text saved to MongoDB");
  } catch (mongoError) {
    console.error("❌ MongoDB insert error:", mongoError);
    return NextResponse.json(
      { error: "Failed to save to MongoDB." },
      { status: 500 }
    );
  }

  return NextResponse.json({ summary, urdu });
}
