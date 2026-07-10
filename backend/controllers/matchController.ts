import type { Request, Response } from "express";
import OpenAI from "openai";
import Job from "../models/jobModel.ts";
import Profile from "../models/profileModel.ts";

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

export const getJobMatch = async(req:Request,res:Response)=>{
    try{
        const job = await Job.findById(req.params.id);
        if(!job){
            return res.status(404).json({message: "Job not found"});
        }
        const profile = await Profile.findOne({user:req.user?._id});

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
}