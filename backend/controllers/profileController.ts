import type {Request,Response} from "express"
import Profile from "../models/profileModel";
import cloudinary from "../config/cloudinary";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const buildResumeParsePrompt = () =>`You extract structured profile data from resume text.
Respond ONLY with valid JSON, no preamble, no markdown code fences, no extra text.
JSON shape must be exactly:
{
  "bio": string,
  "phone": string,
   "location": string,
  "linkedin": string,
  "github": string,
  "portfolio": string,
  "skills": string[],
  "education": [{ "degree": string, "institution": string, "year": string }],
  "experience": [{ "role": string, "company": string, "duration": string, "description": string }],
  "projects": [{ "title": string, "description": string, "techStack": string[], "link": string }]
}
Rules:
- If a field isn't found in the resume, use an empty string (or empty array for arrays).
- "bio" should be a short 2-3 sentence professional summary, written fresh based on the resume content — not copy-pasted.
- "skills" should be short tags (e.g. "React", "Python"), not sentences.
- Keep descriptions concise and well-written, don't copy raw resume text verbatim.
- Only include real entries found in the resume — don't invent placeholder data.`;

const parseResumeText = async (resumeText: string) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: buildResumeParsePrompt() },
      { role: "user", content: resumeText },
    ],
    temperature: 0.3,
  });

  const rawJson = completion.choices[0]?.message?.content || "{}";
  const cleaned = rawJson.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};

export const getMyProfile = async(req:Request,res:Response)=>{
    try{
       let profile = await Profile.findOne({user:req.user?._id});
       
       if(!profile){
        profile = await Profile.create({user:req.user?._id});
       }
       res.status(200).json({profile});

    }catch(err:any){
        res.status(500).json({message:`Error : ${err.message}`});
    }
}

export const updateMyProfile=async(req:Request,res:Response)=>{
    try {
        const {phone,bio,location,education,experience,projects,skills,linkedin,github,portfolio,} = req.body;

        const profile = await Profile.findOneAndUpdate(
            {user:req.user?._id},
            {phone,bio,location,education,experience,projects,skills,linkedin,github,portfolio},
            {new:true, upsert:true}
        );
    res.status(200).json({profile});

    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
}

export const uploadResume = async(req:Request,res:Response)=>{
    try{
        if(!req.file){
            return res.status(400).json({ message: "Please upload a PDF file" });
        } 

        const fileBuffer = req.file.buffer ;

        console.log("before upload result");
        const uploadResult = await new Promise<any>((resolve,reject)=>{
            const stream = cloudinary.uploader.upload_stream({
                resource_type: "raw",
                folder : "jobSphere-resumes",
                public_id : `resume-${req.user?._id}-${Date.now()}`,
            },
            (error,result)=> {
                if(error){
                    reject(error);
                }else{
                    console.log("resolve : ",resolve);
                    resolve(result);
                } 
            });
            stream.end(fileBuffer);
        });
        console.log("After upload result");

        const profile = await Profile.findOneAndUpdate(
            {user : req.user?._id},
            { resumeUrl: uploadResult.secure_url},
            {new:true,upsert:true}
        );

        let parsedData= null ;
        try{
           const parser = new PDFParse({data:fileBuffer});
           const result = await parser.getText();
           await parser.destroy();
           parsedData = await parseResumeText(result.text.slice(0,6000));
        }catch(parseErr){
            console.error("Resume parsing failed (upload still succeeded):", parseErr);
        }
        console.log("check this : ",parsedData);
        res.status(200).json({ profile,parsedData });
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
};