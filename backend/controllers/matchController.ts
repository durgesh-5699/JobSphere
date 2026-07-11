import type { Request, Response } from "express";
import OpenAI from "openai";
import Job from "../models/jobModel.ts";
import Profile from "../models/profileModel.ts";
import JobMatch from "../models/jobMatchModel.ts";
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
    { "jobId": string, "matchPercent": number, "matchedPoints": string[], "missingPoints": string[] }
  ]
}
Rules:
- Return ALL jobs from the provided list, sorted by matchPercent descending.
- Each jobId must appear AT MOST ONCE — never repeat the same jobId.
- "matchedPoints" and "missingPoints" are short arrays (2-4 items each, under 15 words per item) explaining the fit — same level of detail as a single-job match analysis.
- Be honest — if the profile is thin/empty, scores should be low across the board.
- Only include jobId values that exist in the provided job list.`;

const computeMatchForJob = async (job: any, profile: any) => {
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
    Education: ${profile?.education?.map((e: any) => `${e.degree} from ${e.institution} (${e.year})`).join("; ") || "None listed"}
    Experience: ${profile?.experience?.map((e: any) => `${e.role} at ${e.company} (${e.duration}): ${e.description}`).join("; ") || "None listed"}
    Projects: ${profile?.projects?.map((p: any) => `${p.title} (${p.techStack.join(", ")}): ${p.description}`).join("; ") || "None listed"}
  `.trim();

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: buildMatchPrompt() },
      { role: "user", content: `JOB POSTING:\n${jobSummary}\n\nCANDIDATE PROFILE:\n${profileSummary}` },
    ],
    temperature: 0,
  });

  const rawJson = completion.choices[0]?.message?.content || "{}";
  const cleaned = rawJson.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};

export const getJobMatch = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const profile = await Profile.findOne({ user: req.user?._id });

    const cached = await JobMatch.findOne({ user: req.user?._id, job: job._id });

    const profileUpdatedAt = profile?.get("updatedAt") as Date | undefined;
    const cacheIsFresh = cached && (!profileUpdatedAt || cached.computedAt >= profileUpdatedAt);

    if (cacheIsFresh) {
      return res.status(200).json({
        matchPercent: cached.matchPercent,
        matchedPoints: cached.matchedPoints,
        missingPoints: cached.missingPoints,
      });
    }

    const result = await computeMatchForJob(job, profile);

    await JobMatch.findOneAndUpdate(
      { user: req.user?._id, job: job._id },
      {
        matchPercent: result.matchPercent,
        matchedPoints: result.matchedPoints || [],
        missingPoints: result.missingPoints || [],
        computedAt: new Date(),
      },
      { upsert: true }
    );

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};

export const getRecommendedJobs = async (req: Request, res: Response) => {
  try {
    const profile = await Profile.findOne({ user: req.user?._id });
    const allJobs = await getDedupedAccessibleJobs(req.user?._id as string);
    const jobs = allJobs.slice(0, 25);

    if (jobs.length === 0) {
      return res.status(200).json({ recommendations: [] });
    }

    const hasProfileData =
      profile && (profile.skills.length > 0 || profile.experience.length > 0 || profile.projects.length > 0);

    if (!hasProfileData) {
      return res.status(200).json({ recommendations: [], profileIncomplete: true });
    }

    const profileUpdatedAt = profile?.get("updatedAt") as Date | undefined;

    const jobIds = jobs.map((j: any) => j._id);
    const existingMatches = await JobMatch.find({ user: req.user?._id, job: { $in: jobIds } });
    const matchMap = new Map(existingMatches.map((m) => [m.job.toString(), m]));

    const freshResults: any[] = [];
    const jobsNeedingCompute: any[] = [];

    for (const job of jobs) {
      const cached = matchMap.get((job as any)._id.toString());
      const isFresh = cached && (!profileUpdatedAt || cached.computedAt >= profileUpdatedAt);

      if (isFresh) {
        freshResults.push({
          jobId: (job as any)._id.toString(),
          matchPercent: cached!.matchPercent,
          matchedPoints: cached!.matchedPoints,
          missingPoints: cached!.missingPoints,
          job,
        });
      } else {
        jobsNeedingCompute.push(job);
      }
    }

    if (jobsNeedingCompute.length > 0) {
      const jobsSummary = jobsNeedingCompute
        .map(
          (j: any) =>
            `{id: "${j._id}", title: "${j.title}", company: "${j.company}", skills: [${j.skills.join(", ")}], requirements: [${(j.requirements || []).join(", ")}]}`
        )
        .join("\n");

      const profileSummary = `
      Bio: ${profile?.bio || "Not provided"}
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
        temperature: 0,
      });

      const rawJson = completion.choices[0]?.message?.content || "{}";
      const cleaned = rawJson.replace(/```json|```/g, "").trim();
      const result = JSON.parse(cleaned);

      const jobMap = new Map(jobsNeedingCompute.map((j: any) => [j._id.toString(), j]));
      const seenJobIds = new Set<string>();

      for (const r of result.recommendations || []) {
        if (!jobMap.has(r.jobId) || seenJobIds.has(r.jobId)) continue;
        seenJobIds.add(r.jobId);

        await JobMatch.findOneAndUpdate(
          { user: req.user?._id, job: r.jobId },
          {
            matchPercent: r.matchPercent,
            matchedPoints: r.matchedPoints || [],
            missingPoints: r.missingPoints || [],
            computedAt: new Date(),
          },
          { upsert: true }
        );

        freshResults.push({ ...r, job: jobMap.get(r.jobId) });
      }
    }

    const sorted = freshResults
      .sort((a, b) => b.matchPercent - a.matchPercent)
      .slice(0, 6)
      .map((r) => ({
        jobId: r.jobId,
        matchPercent: r.matchPercent,
        reason: r.matchedPoints?.[0] || "Good overall fit",
        job: r.job,
      }));

    res.status(200).json({ recommendations: sorted });
  } catch (err: any) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};