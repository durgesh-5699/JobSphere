import { useState, useEffect, type FormEvent, type KeyboardEvent } from "react";
import {
  Phone,
  MapPin,
  Link2,
  Code2,
  Globe,
  FileText,
  Upload,
  Plus,
  X,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Save,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { fetchMyProfile, updateMyProfile, uploadResume } from "../services/profileService";
import type { Profile, Education, Experience, Project } from "../types/profile.type";

const emptyEducation: Education = { degree: "", institution: "", year: "" };
const emptyExperience: Experience = { role: "", company: "", duration: "", description: "" };
const emptyProject: Project = { title: "", description: "", techStack: [], link: "" };

export default function ProfilePage(){
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Form fields (edit mode ke liye)
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
      const updated = await uploadResume(file);
      setProfile(updated);
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
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500">Loading profile...</p>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div className="bg-slate-50 min-h-[calc(100vh-73px)]">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
                jobSphere
              </span>
              <h1 className="font-display text-3xl font-bold text-slate-900">My Profile</h1>
            </div>
            <button
              onClick={startEditing}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              <Pencil size={15} />
              Edit Profile
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
            {profile?.bio ? (
              <p className="text-slate-600 mb-4">{profile.bio}</p>
            ) : (
              <p className="text-slate-400 italic mb-4">No bio added yet.</p>
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              {profile?.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone size={14} /> {profile.phone}
                </div>
              )}
              {profile?.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} /> {profile.location}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
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
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} className="text-indigo-600" />
              <h2 className="font-display font-bold text-slate-900">Resume</h2>
            </div>
            {profile?.resumeUrl ? (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline"
              >
                <FileText size={14} /> View resume <ExternalLink size={13} />
              </a>
            ) : (
              <p className="text-slate-400 italic text-sm">No resume uploaded yet.</p>
            )}
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
                    {exp.description && (
                      <p className="text-sm text-slate-500 mt-1">{exp.description}</p>
                    )}
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
        </div>
      </div>
    );
  }

  // ==================== EDIT MODE ====================
  return (
    <div className="bg-slate-50 min-h-[calc(100vh-73px)]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-slate-900">Edit Profile</h1>
          <button
            onClick={cancelEditing}
            className="text-sm font-semibold text-slate-500 hover:text-slate-700 px-4 py-2"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-indigo-600" />
            <h2 className="font-display font-bold text-slate-900">Resume</h2>
          </div>
          {profile?.resumeUrl && (
            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline mb-4">
              <FileText size={14} /> View current resume
            </a>
          )}
          <label className="flex items-center gap-2 w-fit cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm font-medium text-slate-700 px-4 py-2.5 rounded-xl transition-colors">
            <Upload size={16} />
            {resumeUploading ? "Uploading..." : profile?.resumeUrl ? "Replace resume (PDF)" : "Upload resume (PDF)"}
            <input type="file" accept="application/pdf" onChange={handleResumeChange} disabled={resumeUploading} className="hidden" />
          </label>
        </div>

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
                      className="flex-1 min-w-[100px] bg-transparent text-sm focus:outline-none py-0.5"
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

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
            {!saving && <Save size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};
