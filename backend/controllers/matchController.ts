import type { Request, Response } from "express";
import OpenAI from "openai";
import Job from "../models/jobModel.ts";
import Profile from "../models/profileModel.ts";
import { getDedupedAccessibleJobs } from "../utils/jobHelper.ts";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const buildMatchPrompt = () => `You compare a student's profile against a job posting and estimate how well they match.
Respond ONLY with valid JSON, no preamble, no markdown fences, no extra text.
JSON shape must be exactly:
{
  "matchPercent": number,
  "matchedPoints": string[],
  "missingPoints": string[]
}
Rules:
- "matchPercent" is 0-100, reflecting overall fit based on skills, requirements, and experience/education relevance.
- "matchedPoints" lists specific things the profile satisfies (e.g. "Has React and Node.js experience matching the required stack", "Meets the B.Tech CS requirement"). Keep each point short (under 15 words).
- "missingPoints" lists specific gaps (e.g. "No experience with AWS, which is required", "Job wants 1+ years experience, profile shows none"). Keep each point short.
- Be honest and specific — don't inflate the score. An empty/thin profile should score low.
- Aim for 2-5 points in each list, prioritizing the most impactful ones.`;

const buildRecommendationPrompt = () => `You are given a student's profile and a list of available jobs (with id, title, company, skills, requirements).
Respond ONLY with valid JSON, no preamble, no markdown fences, no extra text.
JSON shape must be exactly:
{
  "recommendations": [
    { "jobId": string, "matchPercent": number, "reason": string }
  ]
}
Rules:
- Return the top 6 best-matching jobs only, sorted by matchPercent descending.
- Each jobId must appear AT MOST ONCE in the recommendations array — never repeat the same jobId under any circumstance.
- "reason" is a short one-sentence explanation (under 15 words) of why it's a good fit.
- Be honest — if the profile is thin/empty, scores should be low across the board.
- Only include jobId values that exist in the provided job list.`;

export const getJobMatch = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    const profile = await Profile.findOne({ user: req.user?._id });

    const jobSummary = `
            Job Title: ${job.title}
            Company: ${job.company}
            Requirements: ${job.requirements?.join(", ") || "Not specified"}
            Skills required: ${job.skills.join(", ")}
            Description: ${job.description}
            `.trim();

    const profileSummary = `
            Bio: ${profile?.bio || "Not provided"}
            Skills: ${profile?.skills?.join(", ") || "None listed"}
            Education: ${profile?.education?.map((e) => `${e.degree} from ${e.institution} (${e.year})`).join("; ") || "None listed"}
            Experience: ${profile?.experience?.map((e) => `${e.role} at ${e.company} (${e.duration}): ${e.description}`).join("; ") || "None listed"}
            Projects: ${profile?.projects?.map((p) => `${p.title} (${p.techStack.join(", ")}): ${p.description}`).join("; ") || "None listed"}
            `.trim();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: buildMatchPrompt() },
        { role: "user", content: `JOB POSTING:\n${jobSummary}\n\nCANDIDATE PROFILE:\n${profileSummary}` },
      ],
      temperature: 0.3,
    });

    const rawJson = completion.choices[0]?.message?.content || "{}";
    const cleaned = rawJson.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};

export const getRecommendedJobs = async (req: Request, res: Response) => {
  try {
    const profile = await Profile.findOne({ user: req.user?._id });

    const allJobs = await getDedupedAccessibleJobs(req.user?._id as string);
    const jobs = allJobs.slice(0, 15); 

    if (jobs.length === 0) {
      return res.status(200).json({ recommendations: [] });
    }

    const hasProfileData =
      profile && (profile.skills.length > 0 || profile.experience.length > 0 || profile.projects.length > 0);

    if (!hasProfileData) {
      return res.status(200).json({ recommendations: [], profileIncomplete: true });
    }

    const jobsSummary = jobs
      .map(
        (j: any) =>
          `{id: "${j._id}", title: "${j.title}", company: "${j.company}", skills: [${j.skills.join(", ")}], requirements: [${(j.requirements || []).join(", ")}]}`
      )
      .join("\n");

    const profileSummary = `
        Skills: ${profile?.skills?.join(", ") || "None"}
        Education: ${profile?.education?.map((e) => e.degree).join(", ") || "None"}
        Experience: ${profile?.experience?.map((e) => `${e.role} at ${e.company}`).join(", ") || "None"}
        Projects: ${profile?.projects?.map((p) => `${p.title} (${p.techStack.join(", ")})`).join(", ") || "None"}
        `.trim();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: buildRecommendationPrompt() },
        { role: "user", content: `CANDIDATE PROFILE:\n${profileSummary}\n\nAVAILABLE JOBS:\n${jobsSummary}` },
      ],
      temperature: 0.3,
    });

    const rawJson = completion.choices[0]?.message?.content || "{}";
    const cleaned = rawJson.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    const jobMap = new Map(jobs.map((j: any) => [j._id.toString(), j]));
    const seenJobIds = new Set<string>();

    const enrichedRecommendations = (result.recommendations || [])
      .filter((r: any) => {
        if (!jobMap.has(r.jobId)) return false;
        if (seenJobIds.has(r.jobId)) return false; 
        seenJobIds.add(r.jobId);
        return true;
      })
      .map((r: any) => ({
        ...r,
        job: jobMap.get(r.jobId),
      }));

    res.status(200).json({ recommendations: enrichedRecommendations });
  } catch (err: any) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};