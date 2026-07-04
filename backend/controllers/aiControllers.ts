import type { Request, Response } from "express";
import OpenAI from "openai";
import * as cheerio from "cheerio";
import config from "../config/config"

const groq = new OpenAI({
  apiKey: config.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const isUrl = (text: string): boolean => {
  try {
    new URL(text.trim());
    return true;
  } catch {
    return false;
  }
};

const extractStructuredData = ($: cheerio.CheerioAPI): Record<string, any> | null => {
  const scripts = $('script[type="application/ld+json"]');

  for (let i = 0; i < scripts.length; i++) {
    try {
      const jsonText = $(scripts[i]).html();
      if (!jsonText) continue;

      const data = JSON.parse(jsonText);
      const items = Array.isArray(data) ? data : [data];

      const jobPosting = items.find(
        (item) => item["@type"] === "JobPosting" || item["@type"]?.includes?.("JobPosting")
      );

      if (jobPosting) return jobPosting;
    } catch {
      continue; 
    }
  }

  return null;
};

const scrapeJobPage = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page (status ${response.status})`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const structured = extractStructuredData($);
  if (structured) {
    return JSON.stringify(structured);
  }

  $("script, style, nav, footer, header, noscript, svg").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();

  return text.slice(0, 6000);
};

const buildSystemPrompt = () => `You extract structured job posting data from text (which may be raw pasted text, scraped webpage content, or JSON-LD structured data in schema.org JobPosting format).
Respond ONLY with valid JSON, no preamble, no markdown code fences, no extra text.
JSON shape must be exactly:
{
  "title": string,
  "company": string,
  "description": string,
  "location": string,
  "skills": string[],
  "salary": string,
  "applyLink": string
}
If a field isn't mentioned in the text, use an empty string for it (empty array for skills).
Keep "description" as a clean, well-formatted paragraph summarizing the role — rewrite for clarity, don't just copy-paste raw text.
Extract skills as an array of short tags (e.g. "React", "Node.js"), not full sentences.
If the input is JSON-LD structured data, map fields like "title", "hiringOrganization.name", "jobLocation.address", "baseSalary" directly — they are usually accurate and complete.
If the text is scraped webpage content (not structured data), ignore unrelated navigation/footer/ad text and focus only on the actual job posting content.`;

export const parseJobText = async (req: Request, res: Response) => {
  try {
    const { input } = req.body;

    if (!input || input.trim().length < 10) {
      return res.status(400).json({ message: "Please paste job details or a link." });
    }

    let contentToAnalyze = input.trim();
    let sourceApplyLink = "";

    if (isUrl(contentToAnalyze)) {
      sourceApplyLink = contentToAnalyze;
      try {
        contentToAnalyze = await scrapeJobPage(contentToAnalyze);
      } catch (scrapeErr: any) {
        return res.status(400).json({
          message: "Couldn't read that link. Try pasting the job text directly instead.",
        });
      }
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: contentToAnalyze },
      ],
      temperature: 0.3,
    });

    const rawJson = completion.choices[0]?.message?.content || "{}";
    const cleaned = rawJson.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (sourceApplyLink && !parsed.applyLink) {
      parsed.applyLink = sourceApplyLink;
    }

    res.status(200).json({ data: parsed });
  } catch (err: any) {
    console.error("AI parse error:", err);
    res.status(500).json({ message: "Failed to parse job details. Try again." });
  }
};