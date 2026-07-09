import { useState, useEffect, useMemo, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {Phone,MapPin,Mail,Link2,Code2,Globe,FileText,Upload,Plus,X,GraduationCap,Briefcase,FolderGit2,Save,Pencil,ExternalLink,Sparkles,CheckCircle2,} from "lucide-react";
import { fetchMyProfile, updateMyProfile, uploadResume } from "../services/profileService";
import type { ParsedResumeData } from "../types/profile.type";
import useAuth from "../context/useAuth";
import type { Profile, Education, Experience, Project } from "../types/profile.type";

const emptyEducation: Education = { degree: "", institution: "", year: "" };
const emptyExperience: Experience = { role: "", company: "", duration: "", description: "" };
const emptyProject: Project = { title: "", description: "", techStack: [], link: "" };

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function ProfilePage(){
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

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

  const addEducation = () => setEducation([...education, { ...emptyEducation }]);
  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };
  const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));

  const addExperience = () => setExperience([...experience, { ...emptyExperience }]);
  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };
  const removeExperience = (index: number) => setExperience(experience.filter((_, i) => i !== index));

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
      <div className="min-h-[calc(100vh-73px)] bg-[#F6F5F2] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#12151C]/50">
          <span className="w-4 h-4 rounded-full border-2 border-[#12151C]/20 border-t-[#2F5D50] animate-spin" />
          <span className="font-mono text-xs tracking-[0.15em] uppercase">Loading profile</span>
        </div>
      </div>
    );
  }

  const initial = user?.name?.charAt(0).toUpperCase() || "U";
  const topEducation = profile?.education?.[0];

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completion.percent / 100) * circumference;
  const ticks = Array.from({ length: 36 });

  return (
    <div className="bg-[#F6F5F2] min-h-[calc(100vh-73px)]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.2em] uppercase text-[#2F5D50]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F5D50]" />
            jobSphere · Profile
          </span>
          <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#12151C]/35">
            Readiness {completion.percent}%
          </span>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="text-sm text-[#8C2F26] bg-[#FBEAE8] border border-[#F0CFC9] rounded-xl px-4 py-2.5">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="relative bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-8 mb-5 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#2F5D50] via-[#C08B2C] to-[#2F5D50]" />
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-[#C08B2C]" />
            <h2 className="font-display font-semibold text-[#12151C] tracking-tight">Auto-fill with your resume</h2>
          </div>
          <p className="text-sm text-[#12151C]/55 mb-5 max-w-xl">
            Upload your resume and AI drafts your education, experience, skills and projects —
            you review everything before it's saved.
          </p>

          <AnimatePresence>
            {aiSuggestion && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="mb-5 text-sm text-[#2F5D50] bg-[#EAF1EE] border border-[#D3E3DC] rounded-xl px-4 py-2.5 flex items-center gap-2"
              >
                <Sparkles size={14} />
                Filled in details from your resume below — review and save when ready.
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap items-center gap-4">
            <label className="group flex items-center gap-2 w-fit cursor-pointer bg-[#12151C] hover:bg-[#2F5D50] text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-colors duration-200">
              <Upload size={15} className={resumeUploading ? "animate-pulse" : ""} />
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
                className="flex items-center gap-1.5 text-sm font-medium text-[#2F5D50] hover:text-[#12151C] transition-colors"
              >
                <FileText size={14} />
                View current resume
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-[300px_1fr] gap-5 items-start">
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="md:sticky md:top-6 bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-7"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative w-28 h-28 mb-4">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  {ticks.map((_, i) => {
                    const angle = (i / ticks.length) * 360;
                    const isMajor = i % 3 === 0;
                    return (
                      <line
                        key={i}
                        x1="50" y1="4" x2="50" y2={isMajor ? "8" : "6.5"}
                        stroke="#12151C" strokeOpacity="0.12" strokeWidth="1"
                        transform={`rotate(${angle} 50 50)`}
                      />
                    );
                  })}
                  <circle cx="50" cy="50" r={radius} fill="none" stroke="#EDEBE5" strokeWidth="5" />
                  <motion.circle
                    cx="50" cy="50" r={radius} fill="none" stroke="#C08B2C" strokeWidth="5"
                    strokeDasharray={circumference} strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[70px] h-[70px] rounded-full bg-[#12151C] text-white flex items-center justify-center text-xl font-display font-semibold">
                    {initial}
                  </div>
                </div>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 font-mono text-[11px] font-semibold text-[#C08B2C] bg-white border border-[#EADFC4] rounded-full px-2 py-0.5">
                  {completion.percent}%
                </span>
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <h1 className="font-display text-lg font-semibold text-[#12151C] tracking-tight">
                  {user?.name}
                </h1>
                <button
                  onClick={isEditing ? cancelEditing : startEditing}
                  className="text-[#12151C]/30 hover:text-[#2F5D50] transition-colors"
                  aria-label="Edit profile"
                >
                  <Pencil size={14} />
                </button>
              </div>

              {topEducation ? (
                <p className="text-xs text-[#12151C]/55 mb-5">
                  {topEducation.degree} · {topEducation.institution}
                </p>
              ) : (
                <p className="text-xs text-[#12151C]/30 italic mb-5">Add your education</p>
              )}
            </div>

            <div className="space-y-2.5 text-sm text-[#12151C]/65 border-t border-[#EDEBE5] pt-4">
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-[#12151C]/35 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-[#12151C]/35 shrink-0" />
                {profile?.phone || <span className="text-[#12151C]/25 italic">Add phone number</span>}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-[#12151C]/35 shrink-0" />
                {profile?.location || <span className="text-[#12151C]/25 italic">Add location</span>}
              </div>
            </div>

            {(profile?.linkedin || profile?.github || profile?.portfolio) && (
              <div className="flex flex-wrap gap-3 border-t border-[#EDEBE5] mt-4 pt-4">
                {profile?.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#12151C]/40 hover:text-[#2F5D50] transition-colors" aria-label="LinkedIn">
                    <Link2 size={15} />
                  </a>
                )}
                {profile?.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-[#12151C]/40 hover:text-[#2F5D50] transition-colors" aria-label="GitHub">
                    <Code2 size={15} />
                  </a>
                )}
                {profile?.portfolio && (
                  <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-[#12151C]/40 hover:text-[#2F5D50] transition-colors" aria-label="Portfolio">
                    <Globe size={15} />
                  </a>
                )}
              </div>
            )}

            {completion.missing.length > 0 ? (
              <div className="mt-5 pt-5 border-t border-[#EDEBE5]">
                <p className="font-mono text-[10px] font-semibold text-[#C08B2C] uppercase tracking-[0.15em] mb-3">
                  Next up
                </p>
                <div className="space-y-2 mb-4">
                  {completion.missing.slice(0, 3).map((item) => (
                    <button
                      key={item.label}
                      onClick={startEditing}
                      className="flex items-center justify-between w-full text-left group"
                    >
                      <span className="text-xs font-medium text-[#12151C]/70 group-hover:text-[#2F5D50] transition-colors">
                        {item.label}
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-[#2F5D50] bg-[#EAF1EE] px-1.5 py-0.5 rounded">
                        +{item.points}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={startEditing}
                  className="w-full bg-[#FBF3E3] hover:bg-[#F5E7C8] text-[#8A6316] text-xs font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Complete {completion.missing.length} more detail{completion.missing.length > 1 ? "s" : ""}
                </button>
              </div>
            ) : (
              <div className="mt-5 pt-5 border-t border-[#EDEBE5] flex items-center gap-2 text-[#2F5D50]">
                <CheckCircle2 size={16} />
                <p className="text-xs font-semibold">Profile complete</p>
              </div>
            )}
          </motion.div>

          <div className="min-w-0">
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <motion.section variants={fadeUp} initial="hidden" animate="show" custom={2} className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-7">
                    <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em] mb-3">Summary</p>
                    {profile?.bio ? (
                      <p className="text-[#12151C]/75 leading-relaxed">{profile.bio}</p>
                    ) : (
                      <p className="text-[#12151C]/30 italic text-sm">No summary added yet.</p>
                    )}
                  </motion.section>

                  <motion.section variants={fadeUp} initial="hidden" animate="show" custom={3} className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-7">
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap size={16} className="text-[#2F5D50]" />
                      <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em]">Education</p>
                    </div>
                    {profile?.education.length ? (
                      <div className="space-y-4">
                        {profile.education.map((edu, i) => (
                          <div key={i} className={i > 0 ? "pt-4 border-t border-[#EDEBE5]" : ""}>
                            <p className="font-semibold text-[#12151C]">{edu.degree}</p>
                            <p className="text-sm text-[#12151C]/60">{edu.institution}</p>
                            <p className="font-mono text-xs text-[#12151C]/35 mt-0.5">{edu.year}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#12151C]/30 italic text-sm">No education added yet.</p>
                    )}
                  </motion.section>

                  <motion.section variants={fadeUp} initial="hidden" animate="show" custom={4} className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-7">
                    <div className="flex items-center gap-2 mb-4">
                      <Briefcase size={16} className="text-[#2F5D50]" />
                      <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em]">Experience</p>
                    </div>
                    {profile?.experience.length ? (
                      <div className="space-y-4">
                        {profile.experience.map((exp, i) => (
                          <div key={i} className={i > 0 ? "pt-4 border-t border-[#EDEBE5]" : ""}>
                            <p className="font-semibold text-[#12151C]">{exp.role}</p>
                            <p className="text-sm text-[#12151C]/60">{exp.company} · <span className="font-mono">{exp.duration}</span></p>
                            {exp.description && <p className="text-sm text-[#12151C]/55 mt-1.5">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#12151C]/30 italic text-sm">No experience added yet.</p>
                    )}
                  </motion.section>

                  <motion.section variants={fadeUp} initial="hidden" animate="show" custom={5} className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-7">
                    <div className="flex items-center gap-2 mb-4">
                      <FolderGit2 size={16} className="text-[#2F5D50]" />
                      <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em]">Projects</p>
                    </div>
                    {profile?.projects.length ? (
                      <div className="space-y-4">
                        {profile.projects.map((proj, i) => (
                          <div key={i} className={i > 0 ? "pt-4 border-t border-[#EDEBE5]" : ""}>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-[#12151C]">{proj.title}</p>
                              {proj.link && (
                                <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-[#2F5D50] hover:text-[#12151C] transition-colors">
                                  <ExternalLink size={13} />
                                </a>
                              )}
                            </div>
                            <p className="text-sm text-[#12151C]/55 mt-1.5">{proj.description}</p>
                            {proj.techStack.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {proj.techStack.map((tech) => (
                                  <span key={tech} className="font-mono text-[11px] font-medium text-[#2F5D50] bg-[#EAF1EE] px-2 py-0.5 rounded-md">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#12151C]/30 italic text-sm">No projects added yet.</p>
                    )}
                  </motion.section>

                  <motion.section variants={fadeUp} initial="hidden" animate="show" custom={6} className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-7">
                    <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em] mb-4">Skills</p>
                    {profile?.skills.length ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <span key={skill} className="font-mono text-[11px] font-medium text-[#8A6316] bg-[#FBF3E3] px-2.5 py-1 rounded-md">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#12151C]/30 italic text-sm">No skills added yet.</p>
                    )}
                  </motion.section>
                </motion.div>
              ) : (
                <motion.form
                  key="edit"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  <div className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-7">
                    <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em] mb-4">Basic info</p>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12151C]/30" />
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow" />
                      </div>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12151C]/30" />
                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow" />
                      </div>
                    </div>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Short bio / summary"
                      className="w-full px-4 py-3 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] resize-none transition-shadow" />
                  </div>

                  <div className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-7">
                    <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em] mb-4">Links</p>
                    <div className="space-y-3">
                      <div className="relative">
                        <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12151C]/30" />
                        <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn URL"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow" />
                      </div>
                      <div className="relative">
                        <Code2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12151C]/30" />
                        <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="GitHub URL"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow" />
                      </div>
                      <div className="relative">
                        <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12151C]/30" />
                        <input type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="Portfolio URL"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-7">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={16} className="text-[#2F5D50]" />
                        <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em]">Education</p>
                      </div>
                      <button type="button" onClick={addEducation} className="flex items-center gap-1 text-sm font-medium text-[#2F5D50] hover:text-[#12151C] transition-colors">
                        <Plus size={15} /> Add
                      </button>
                    </div>
                    {education.length === 0 && <p className="text-sm text-[#12151C]/35">No education added yet.</p>}
                    <div className="space-y-3">
                      <AnimatePresence initial={false}>
                        {education.map((edu, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl p-4"
                          >
                            <button type="button" onClick={() => removeEducation(index)} className="absolute top-3 right-3 text-[#12151C]/30 hover:text-[#B3413A] transition-colors">
                              <X size={16} />
                            </button>
                            <div className="grid sm:grid-cols-2 gap-3 mb-3">
                              <input type="text" value={edu.degree} onChange={(e) => updateEducation(index, "degree", e.target.value)} placeholder="Degree"
                                className="px-3 py-2 bg-white border border-[#E4E2DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40" />
                              <input type="text" value={edu.year} onChange={(e) => updateEducation(index, "year", e.target.value)} placeholder="Year"
                                className="px-3 py-2 bg-white border border-[#E4E2DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40" />
                            </div>
                            <input type="text" value={edu.institution} onChange={(e) => updateEducation(index, "institution", e.target.value)} placeholder="Institution"
                              className="w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40" />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-7">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-[#2F5D50]" />
                        <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em]">Experience</p>
                      </div>
                      <button type="button" onClick={addExperience} className="flex items-center gap-1 text-sm font-medium text-[#2F5D50] hover:text-[#12151C] transition-colors">
                        <Plus size={15} /> Add
                      </button>
                    </div>
                    {experience.length === 0 && <p className="text-sm text-[#12151C]/35">No experience added yet.</p>}
                    <div className="space-y-3">
                      <AnimatePresence initial={false}>
                        {experience.map((exp, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl p-4"
                          >
                            <button type="button" onClick={() => removeExperience(index)} className="absolute top-3 right-3 text-[#12151C]/30 hover:text-[#B3413A] transition-colors">
                              <X size={16} />
                            </button>
                            <div className="grid sm:grid-cols-2 gap-3 mb-3">
                              <input type="text" value={exp.role} onChange={(e) => updateExperience(index, "role", e.target.value)} placeholder="Role"
                                className="px-3 py-2 bg-white border border-[#E4E2DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40" />
                              <input type="text" value={exp.company} onChange={(e) => updateExperience(index, "company", e.target.value)} placeholder="Company"
                                className="px-3 py-2 bg-white border border-[#E4E2DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40" />
                            </div>
                            <input type="text" value={exp.duration} onChange={(e) => updateExperience(index, "duration", e.target.value)} placeholder="Duration"
                              className="w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 mb-3" />
                            <textarea value={exp.description} onChange={(e) => updateExperience(index, "description", e.target.value)} rows={2} placeholder="Description"
                              className="w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 resize-none" />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-7">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FolderGit2 size={16} className="text-[#2F5D50]" />
                        <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em]">Projects</p>
                      </div>
                      <button type="button" onClick={addProject} className="flex items-center gap-1 text-sm font-medium text-[#2F5D50] hover:text-[#12151C] transition-colors">
                        <Plus size={15} /> Add
                      </button>
                    </div>
                    {projects.length === 0 && <p className="text-sm text-[#12151C]/35">No projects added yet.</p>}
                    <div className="space-y-3">
                      <AnimatePresence initial={false}>
                        {projects.map((proj, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl p-4"
                          >
                            <button type="button" onClick={() => removeProject(index)} className="absolute top-3 right-3 text-[#12151C]/30 hover:text-[#B3413A] transition-colors">
                              <X size={16} />
                            </button>
                            <div className="grid sm:grid-cols-2 gap-3 mb-3">
                              <input type="text" value={proj.title} onChange={(e) => updateProject(index, "title", e.target.value)} placeholder="Project title"
                                className="px-3 py-2 bg-white border border-[#E4E2DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40" />
                              <input type="url" value={proj.link || ""} onChange={(e) => updateProject(index, "link", e.target.value)} placeholder="Live/GitHub link (optional)"
                                className="px-3 py-2 bg-white border border-[#E4E2DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40" />
                            </div>
                            <textarea value={proj.description} onChange={(e) => updateProject(index, "description", e.target.value)} rows={2} placeholder="What does this project do?"
                              className="w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 resize-none mb-3" />
                            <div className="flex flex-wrap items-center gap-2 w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-lg">
                              {proj.techStack.map((tech) => (
                                <span key={tech} className="flex items-center gap-1 font-mono text-[11px] font-medium text-[#2F5D50] bg-[#EAF1EE] pl-2 pr-1 py-1 rounded-md">
                                  {tech}
                                  <button type="button" onClick={() => removeTech(index, tech)} className="hover:bg-[#D3E3DC] rounded-full p-0.5 transition-colors">
                                    <X size={11} />
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
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-7">
                    <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em] mb-4">Skills</p>
                    <div className="flex flex-wrap items-center gap-2 w-full px-3 py-2.5 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl focus-within:ring-2 focus-within:ring-[#2F5D50]/40 focus-within:border-[#2F5D50] transition-all">
                      {skills.map((skill) => (
                        <span key={skill} className="flex items-center gap-1 font-mono text-[11px] font-medium text-[#8A6316] bg-[#FBF3E3] pl-2 pr-1 py-1 rounded-md">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="hover:bg-[#F0DFB4] rounded-full p-0.5 transition-colors">
                            <X size={11} />
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

                  <div className="flex gap-3 sticky bottom-4">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="flex-1 text-sm font-semibold text-[#12151C]/60 bg-white border border-[#E4E2DC] hover:bg-[#F6F5F2] py-3.5 rounded-xl transition-colors shadow-sm"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#12151C] hover:bg-[#2F5D50] text-white font-semibold text-sm py-3.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {saving ? "Saving..." : "Save profile"}
                      {!saving && <Save size={16} />}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};