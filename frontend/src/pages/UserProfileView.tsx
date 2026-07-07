import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Link2, Code2, Globe, FileText,
  GraduationCap, Briefcase, FolderGit2, ExternalLink,
} from "lucide-react";
import { fetchProfileByUserId } from "../services/profileService";

export default function UserProfileView(){
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) loadProfile(userId);
  }, [userId]);

  const loadProfile = async (id: string) => {
    try {
      setLoading(true);
      const data = await fetchProfileByUserId(id);
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-6 py-20 text-center"><p className="text-slate-500">Loading...</p></div>;
  }

  if (!profile) {
    return <div className="max-w-3xl mx-auto px-6 py-20 text-center"><p className="text-slate-500">Profile not found.</p></div>;
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-73px)]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">{profile.user?.name}</h1>
          <p className="text-sm text-slate-500 mb-4">{profile.user?.email}</p>
          {profile.bio && <p className="text-slate-600 leading-relaxed mb-4">{profile.bio}</p>}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 mb-3">
            {profile.location && <div className="flex items-center gap-1.5"><MapPin size={14} />{profile.location}</div>}
          </div>
          <div className="flex flex-wrap gap-4">
            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"><Link2 size={14} /> LinkedIn</a>}
            {profile.github && <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"><Code2 size={14} /> GitHub</a>}
            {profile.portfolio && <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"><Globe size={14} /> Portfolio</a>}
          </div>
          {profile.resumeUrl && (
            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline mt-4">
              <FileText size={14} /> View resume <ExternalLink size={12} />
            </a>
          )}
        </div>

        {profile.education?.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-2 mb-4"><GraduationCap size={18} className="text-indigo-600" /><h2 className="font-display font-bold text-slate-900">Education</h2></div>
            <div className="space-y-4">
              {profile.education.map((edu: any, i: number) => (
                <div key={i} className={i > 0 ? "pt-4 border-t border-slate-100" : ""}>
                  <p className="font-semibold text-slate-800">{edu.degree}</p>
                  <p className="text-sm text-slate-600">{edu.institution}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.experience?.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-2 mb-4"><Briefcase size={18} className="text-indigo-600" /><h2 className="font-display font-bold text-slate-900">Experience</h2></div>
            <div className="space-y-4">
              {profile.experience.map((exp: any, i: number) => (
                <div key={i} className={i > 0 ? "pt-4 border-t border-slate-100" : ""}>
                  <p className="font-semibold text-slate-800">{exp.role}</p>
                  <p className="text-sm text-slate-600">{exp.company} · {exp.duration}</p>
                  {exp.description && <p className="text-sm text-slate-500 mt-1">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.projects?.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-2 mb-4"><FolderGit2 size={18} className="text-indigo-600" /><h2 className="font-display font-bold text-slate-900">Projects</h2></div>
            <div className="space-y-4">
              {profile.projects.map((proj: any, i: number) => (
                <div key={i} className={i > 0 ? "pt-4 border-t border-slate-100" : ""}>
                  <p className="font-semibold text-slate-800">{proj.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.skills?.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            <h2 className="font-display font-bold text-slate-900 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <span key={skill} className="text-xs font-medium text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};