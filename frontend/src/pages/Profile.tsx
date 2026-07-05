import { useState, useEffect, useMemo, type FormEvent, type KeyboardEvent } from "react";
import {Phone,MapPin,Mail,Link2,Code2,Globe,FileText,Upload,Plus,X,GraduationCap,Briefcase,FolderGit2,Save,Pencil,ExternalLink,Sparkles,CheckCircle2,} from "lucide-react";
import { fetchMyProfile, updateMyProfile, uploadResume } from "../services/profileService";
import type { ParsedResumeData } from "../types/profile.type";
import useAuth from "../context/useAuth";
import type { Profile, Education, Experience, Project } from "../types/profile.type";

const emptyEducation: Education = { degree: "", institution: "", year: "" };
const emptyExperience: Experience = { role: "", company: "", duration: "", description: "" };
const emptyProject: Project = { title: "", description: "", techStack: [], link: "" };

export default function ProfilePage(){
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Form fields
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [techInputs, setTechInputs] = useState<Record<number, string>>({});

  const [resumeUploading, setResumeUploading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchMyProfile();
      setProfile(data);
      hydrateFormFromProfile(data);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const hydrateFormFromProfile = (data: Profile) => {
    setPhone(data.phone || "");
    setBio(data.bio || "");
    setLocation(data.location || "");
    setLinkedin(data.linkedin || "");
    setGithub(data.github || "");
    setPortfolio(data.portfolio || "");
    setEducation(data.education || []);
    setExperience(data.experience || []);
    setProjects(data.projects || []);
    setSkills(data.skills || []);
  };

  const startEditing = () => {
    if (profile) hydrateFormFromProfile(profile);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (profile) hydrateFormFromProfile(profile);
    setIsEditing(false);
    setError("");
  };

  // --- Completion calculation ---
  const completion = useMemo(() => {
    if (!profile) return { percent: 0, missing: [] as { label: string; points: number }[] };

    const checks: { label: string; done: boolean; points: number }[] = [
      { label: "Phone number", done: !!profile.phone, points: 8 },
      { label: "Profile summary", done: !!profile.bio, points: 10 },
      { label: "Location", done: !!profile.location, points: 6 },
      { label: "Resume", done: !!profile.resumeUrl, points: 15 },
      { label: "Education", done: profile.education.length > 0, points: 12 },
      { label: "Experience", done: profile.experience.length > 0, points: 15 },
      { label: "Projects", done: profile.projects.length > 0, points: 12 },
      { label: "Skills", done: profile.skills.length > 0, points: 12 },
      { label: "Links (LinkedIn/GitHub/Portfolio)", done: !!(profile.linkedin || profile.github || profile.portfolio), points: 10 },
    ];

    const totalPoints = checks.reduce((sum, c) => sum + c.points, 0);
    const earnedPoints = checks.filter((c) => c.done).reduce((sum, c) => sum + c.points, 0);
    const percent = Math.round((earnedPoints / totalPoints) * 100);
    const missing = checks.filter((c) => !c.done).map((c) => ({ label: c.label, points: c.points }));

    return { percent, missing };
  }, [profile]);

  // --- Education handlers ---
  const addEducation = () => setEducation([...education, { ...emptyEducation }]);
  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };
  const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));

  // --- Experience handlers ---
  const addExperience = () => setExperience([...experience, { ...emptyExperience }]);
  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };
  const removeExperience = (index: number) => setExperience(experience.filter((_, i) => i !== index));

  // --- Project handlers ---
  const addProject = () => setProjects([...projects, { ...emptyProject }]);
  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };
  const removeProject = (index: number) => setProjects(projects.filter((_, i) => i !== index));

  const handleTechKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = (techInputs[index] || "").trim();
      if (value) {
        const updated = [...projects];
        if (!updated[index].techStack.includes(value)) {
          updated[index] = { ...updated[index], techStack: [...updated[index].techStack, value] };
          setProjects(updated);
        }
        setTechInputs({ ...techInputs, [index]: "" });
      }
    }
  };
  const removeTech = (projIndex: number, tech: string) => {
    const updated = [...projects];
    updated[projIndex] = {
      ...updated[projIndex],
      techStack: updated[projIndex].techStack.filter((t) => t !== tech),
    };
    setProjects(updated);
  };

  // --- Skills tag input ---
  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = skillInput.trim();
      if (trimmed && !skills.includes(trimmed)) {
        setSkills([...skills, trimmed]);
      }
      setSkillInput("");
    } else if (e.key === "Backspace" && skillInput === "" && skills.length > 0) {
      setSkills(skills.slice(0, -1));
    }
  };
  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  // --- AI merge from resume ---
  const mergeParsedResumeData = (parsed: ParsedResumeData) => {
    if (!bio && parsed.bio) setBio(parsed.bio);
    if (!phone && parsed.phone) setPhone(parsed.phone);
    if (!location && parsed.location) setLocation(parsed.location);
    if (!linkedin && parsed.linkedin) setLinkedin(parsed.linkedin);
    if (!github && parsed.github) setGithub(parsed.github);
    if (!portfolio && parsed.portfolio) setPortfolio(parsed.portfolio);

    if (parsed.skills?.length) {
      setSkills((prev) => Array.from(new Set([...prev, ...parsed.skills])));
    }
    if (education.length === 0 && parsed.education?.length) setEducation(parsed.education);
    if (experience.length === 0 && parsed.experience?.length) setExperience(parsed.experience);
    if (projects.length === 0 && parsed.projects?.length) setProjects(parsed.projects);
  };

  // --- Resume upload (AI auto-fill) ---
  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setError("");
    setResumeUploading(true);
    try {
      const { profile: updatedProfile, parsedData } = await uploadResume(file);
      setProfile(updatedProfile);
      hydrateFormFromProfile(updatedProfile);

      if (parsedData) {
        mergeParsedResumeData(parsedData);
        setAiSuggestion(true);
        setIsEditing(true); // review ke liye seedha edit mode me le jao
        setTimeout(() => setAiSuggestion(false), 6000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload resume.");
    } finally {
      setResumeUploading(false);
    }
  };

  // --- Save profile ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const updated = await updateMyProfile({
        phone, bio, location, linkedin, github, portfolio,
        education, experience, projects, skills,
      });
      setProfile(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500">Loading profile...</p>
      </div>
    );
  }

  const initial = user?.name?.charAt(0).toUpperCase() || "U";
  const topEducation = profile?.education?.[0];

  // SVG ring math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completion.percent / 100) * circumference;

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-73px)]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <span className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4">
          CampusHire
        </span>

        {error && (
          <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        {/* ===== AI Resume Upload — always visible at top ===== */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-amber-500" />
            <h2 className="font-display font-bold text-slate-900">Auto-fill with your resume</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Upload your resume and AI will fill in your education, experience, skills and
            projects for you — review before saving.
          </p>

          {aiSuggestion && (
            <div className="mb-4 text-sm text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <Sparkles size={14} />
              AI filled in details from your resume below — review and save when ready.
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 w-fit cursor-pointer bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
              <Upload size={16} />
              {resumeUploading ? "Reading resume..." : profile?.resumeUrl ? "Replace resume" : "Upload resume (PDF)"}
              <input
                type="file"
                accept="application/pdf"
                onChange={handleResumeChange}
                disabled={resumeUploading}
                className="hidden"
              />
            </label>

            {profile?.resumeUrl && (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline"
              >
                <FileText size={14} />
                View current resume
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* ===== Hero card: avatar + basic info + completion panel ===== */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left: avatar + name + basic info */}
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-5">
              {/* Avatar with completion ring */}
              <div className="relative w-24 h-24 shrink-0 mx-auto sm:mx-0">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
                    {initial}
                  </div>
                </div>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[11px] font-bold text-amber-600 bg-white border border-amber-200 rounded-full px-2 py-0.5">
                  {completion.percent}%
                </span>
              </div>

              {/* Name + info */}
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-display text-2xl font-bold text-slate-900">
                    {user?.name}
                  </h1>
                  <button
                    onClick={isEditing ? cancelEditing : startEditing}
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                    aria-label="Edit profile"
                  >
                    <Pencil size={16} />
                  </button>
                </div>

                {topEducation ? (
                  <p className="text-sm font-medium text-slate-600 mb-3">
                    {topEducation.degree} · {topEducation.institution}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic mb-3">Add your education</p>
                )}

                <div className="flex flex-col gap-1.5 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Mail size={13} />
                    {user?.email}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} />
                    {profile?.phone || <span className="text-slate-300 italic">Add phone number</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} />
                    {profile?.location || <span className="text-slate-300 italic">Add location</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: completion panel */}
            {completion.missing.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-3">
                  Complete your profile
                </p>
                <div className="space-y-2.5 mb-4">
                  {completion.missing.slice(0, 3).map((item) => (
                    <button
                      key={item.label}
                      onClick={startEditing}
                      className="flex items-center justify-between w-full text-left group"
                    >
                      <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                        Add {item.label}
                      </span>
                      <span className="text-xs font-semibold text-green-700 bg-white px-2 py-0.5 rounded-full">
                        +{item.points}%
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={startEditing}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Add {completion.missing.length} missing detail{completion.missing.length > 1 ? "s" : ""}
                </button>
              </div>
            )}

            {completion.missing.length === 0 && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <CheckCircle2 size={28} className="text-green-600 mb-2" />
                <p className="text-sm font-semibold text-green-700">Profile complete!</p>
                <p className="text-xs text-green-600 mt-1">Recruiters can see your full picture.</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== View mode: read-only sections ===== */}
        {!isEditing && (
          <>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
              <h2 className="font-display font-bold text-slate-900 mb-3">Profile Summary</h2>
              {profile?.bio ? (
                <p className="text-slate-600 leading-relaxed">{profile.bio}</p>
              ) : (
                <p className="text-slate-400 italic text-sm">No summary added yet.</p>
              )}
              <div className="flex flex-wrap gap-4 mt-4">
                {profile?.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
                    <Link2 size={14} /> LinkedIn
                  </a>
                )}
                {profile?.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
                    <Code2 size={14} /> GitHub
                  </a>
                )}
                {profile?.portfolio && (
                  <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
                    <Globe size={14} /> Portfolio
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap size={18} className="text-indigo-600" />
                <h2 className="font-display font-bold text-slate-900">Education</h2>
              </div>
              {profile?.education.length ? (
                <div className="space-y-4">
                  {profile.education.map((edu, i) => (
                    <div key={i} className={i > 0 ? "pt-4 border-t border-slate-100" : ""}>
                      <p className="font-semibold text-slate-800">{edu.degree}</p>
                      <p className="text-sm text-slate-600">{edu.institution}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{edu.year}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-sm">No education added yet.</p>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase size={18} className="text-indigo-600" />
                <h2 className="font-display font-bold text-slate-900">Experience</h2>
              </div>
              {profile?.experience.length ? (
                <div className="space-y-4">
                  {profile.experience.map((exp, i) => (
                    <div key={i} className={i > 0 ? "pt-4 border-t border-slate-100" : ""}>
                      <p className="font-semibold text-slate-800">{exp.role}</p>
                      <p className="text-sm text-slate-600">{exp.company} · {exp.duration}</p>
                      {exp.description && <p className="text-sm text-slate-500 mt-1">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-sm">No experience added yet.</p>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <FolderGit2 size={18} className="text-indigo-600" />
                <h2 className="font-display font-bold text-slate-900">Projects</h2>
              </div>
              {profile?.projects.length ? (
                <div className="space-y-4">
                  {profile.projects.map((proj, i) => (
                    <div key={i} className={i > 0 ? "pt-4 border-t border-slate-100" : ""}>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800">{proj.title}</p>
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600">
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{proj.description}</p>
                      {proj.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {proj.techStack.map((tech) => (
                            <span key={tech} className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-sm">No projects added yet.</p>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
              <h2 className="font-display font-bold text-slate-900 mb-4">Skills</h2>
              {profile?.skills.length ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="text-xs font-medium text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-sm">No skills added yet.</p>
              )}
            </div>
          </>
        )}

        {/* ===== Edit mode: full form ===== */}
        {isEditing && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
              <h2 className="font-display font-bold text-slate-900 mb-4">Basic Info</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="relative">
                  <MapPin size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Short bio / summary"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
              <h2 className="font-display font-bold text-slate-900 mb-4">Links</h2>
              <div className="space-y-3">
                <div className="relative">
                  <Link2 size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn URL"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="relative">
                  <Code2 size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="GitHub URL"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="relative">
                  <Globe size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="Portfolio URL"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap size={18} className="text-indigo-600" />
                  <h2 className="font-display font-bold text-slate-900">Education</h2>
                </div>
                <button type="button" onClick={addEducation} className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  <Plus size={15} /> Add
                </button>
              </div>
              {education.length === 0 && <p className="text-sm text-slate-400">No education added yet.</p>}
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className="relative bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <button type="button" onClick={() => removeEducation(index)} className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition-colors">
                      <X size={16} />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <input type="text" value={edu.degree} onChange={(e) => updateEducation(index, "degree", e.target.value)} placeholder="Degree"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="text" value={edu.year} onChange={(e) => updateEducation(index, "year", e.target.value)} placeholder="Year"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <input type="text" value={edu.institution} onChange={(e) => updateEducation(index, "institution", e.target.value)} placeholder="Institution"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase size={18} className="text-indigo-600" />
                  <h2 className="font-display font-bold text-slate-900">Experience</h2>
                </div>
                <button type="button" onClick={addExperience} className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  <Plus size={15} /> Add
                </button>
              </div>
              {experience.length === 0 && <p className="text-sm text-slate-400">No experience added yet.</p>}
              <div className="space-y-4">
                {experience.map((exp, index) => (
                  <div key={index} className="relative bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <button type="button" onClick={() => removeExperience(index)} className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition-colors">
                      <X size={16} />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <input type="text" value={exp.role} onChange={(e) => updateExperience(index, "role", e.target.value)} placeholder="Role"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="text" value={exp.company} onChange={(e) => updateExperience(index, "company", e.target.value)} placeholder="Company"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <input type="text" value={exp.duration} onChange={(e) => updateExperience(index, "duration", e.target.value)} placeholder="Duration"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3" />
                    <textarea value={exp.description} onChange={(e) => updateExperience(index, "description", e.target.value)} rows={2} placeholder="Description"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderGit2 size={18} className="text-indigo-600" />
                  <h2 className="font-display font-bold text-slate-900">Projects</h2>
                </div>
                <button type="button" onClick={addProject} className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  <Plus size={15} /> Add
                </button>
              </div>
              {projects.length === 0 && <p className="text-sm text-slate-400">No projects added yet.</p>}
              <div className="space-y-4">
                {projects.map((proj, index) => (
                  <div key={index} className="relative bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <button type="button" onClick={() => removeProject(index)} className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition-colors">
                      <X size={16} />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <input type="text" value={proj.title} onChange={(e) => updateProject(index, "title", e.target.value)} placeholder="Project title"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="url" value={proj.link || ""} onChange={(e) => updateProject(index, "link", e.target.value)} placeholder="Live/GitHub link (optional)"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <textarea value={proj.description} onChange={(e) => updateProject(index, "description", e.target.value)} rows={2} placeholder="What does this project do?"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3" />
                    <div className="flex flex-wrap items-center gap-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg">
                      {proj.techStack.map((tech) => (
                        <span key={tech} className="flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 pl-2.5 pr-1.5 py-1 rounded-full">
                          {tech}
                          <button type="button" onClick={() => removeTech(index, tech)} className="hover:bg-indigo-100 rounded-full p-0.5 transition-colors">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={techInputs[index] || ""}
                        onChange={(e) => setTechInputs({ ...techInputs, [index]: e.target.value })}
                        onKeyDown={(e) => handleTechKeyDown(e, index)}
                        placeholder={proj.techStack.length === 0 ? "Tech used, hit Enter" : "Add more..."}
                        className="flex-1 min-w-25 bg-transparent text-sm focus:outline-none py-0.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
              <h2 className="font-display font-bold text-slate-900 mb-4">Skills</h2>
              <div className="flex flex-wrap items-center gap-2 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                {skills.map((skill) => (
                  <span key={skill} className="flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 pl-2.5 pr-1.5 py-1 rounded-full">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:bg-indigo-100 rounded-full p-0.5 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder={skills.length === 0 ? "Type a skill and hit Enter" : "Add more..."}
                  className="flex-1 min-w-30 bg-transparent text-sm focus:outline-none py-0.5"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelEditing}
                className="flex-1 text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 py-3.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Profile"}
                {!saving && <Save size={16} />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
