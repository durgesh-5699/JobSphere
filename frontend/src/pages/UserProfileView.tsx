import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Link2,
  Code2,
  Globe,
  FileText,
  GraduationCap,
  Briefcase,
  FolderGit2,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { fetchProfileByUserId } from "../services/profileService";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: i * 0.08,
      ease: [0.22, 1, 0.36, 1] as const
    },
  }),
};

export default function UserProfileView() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadProfile(userId);
    }
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
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#F6F5F2] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#12151C]/50">
          <span className="w-4 h-4 rounded-full border-2 border-[#12151C]/20 border-t-[#2F5D50] animate-spin" />
          <span className="font-mono text-xs tracking-[0.15em] uppercase">
            Loading
          </span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-[#12151C]/50 mb-4">
          This profile doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F5F2] min-h-[calc(100vh-73px)]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        <motion.button
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-[#12151C]/50 hover:text-[#12151C] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-8 mb-5"
        >
          <h1 className="font-display text-2xl font-semibold text-[#12151C] tracking-tight mb-1">
            {profile.user?.name}
          </h1>

          <p className="text-sm text-[#12151C]/50 mb-4">
            {profile.user?.email}
          </p>

          {profile.bio && (
            <p className="text-[#12151C]/70 leading-relaxed mb-5">
              {profile.bio}
            </p>
          )}

          {profile.location && (
            <div className="flex items-center gap-1.5 text-sm text-[#12151C]/55 mb-5">
              <MapPin size={14} />
              {profile.location}
            </div>
          )}

          <div className="flex flex-wrap gap-4">

            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-[#2F5D50] hover:text-[#12151C] transition-colors"
              >
                <Link2 size={14} />
                LinkedIn
              </a>
            )}

            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-[#2F5D50] hover:text-[#12151C] transition-colors"
              >
                <Code2 size={14} />
                GitHub
              </a>
            )}

            {profile.portfolio && (
              <a
                href={profile.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-[#2F5D50] hover:text-[#12151C] transition-colors"
              >
                <Globe size={14} />
                Portfolio
              </a>
            )}
          </div>

          {profile.resumeUrl && (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-sm text-white bg-[#12151C] hover:bg-[#2F5D50] px-6 py-3 rounded-xl transition-colors mt-6"
            >
              <FileText size={16} />
              View Resume
              <ExternalLink size={14} />
            </a>
          )}
        </motion.div>

        {profile.education?.length > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-8 mb-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={16} className="text-[#2F5D50]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#12151C]/35">
                Education
              </p>
            </div>

            <div className="space-y-4">
              {profile.education.map((edu: any, index: number) => (
                <div
                  key={index}
                  className={index > 0 ? "pt-4 border-t border-[#E4E2DC]" : ""}
                >
                  <p className="font-semibold">{edu.degree}</p>
                  <p className="text-sm text-[#12151C]/60">
                    {edu.institution}
                  </p>
                  <p className="font-mono text-xs text-[#12151C]/40 mt-1">
                    {edu.year}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {profile.experience?.length > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-8 mb-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Briefcase size={16} className="text-[#2F5D50]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#12151C]/35">
                Experience
              </p>
            </div>

            <div className="space-y-4">
              {profile.experience.map((exp: any, index: number) => (
                <div
                  key={index}
                  className={index > 0 ? "pt-4 border-t border-[#E4E2DC]" : ""}
                >
                  <p className="font-semibold">{exp.role}</p>

                  <p className="text-sm text-[#12151C]/60">
                    {exp.company} • {exp.duration}
                  </p>

                  {exp.description && (
                    <p className="text-sm text-[#12151C]/55 mt-2">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {profile.projects?.length > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-8 mb-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <FolderGit2 size={16} className="text-[#2F5D50]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#12151C]/35">
                Projects
              </p>
            </div>

            <div className="space-y-4">
              {profile.projects.map((project: any, index: number) => (
                <div
                  key={index}
                  className={index > 0 ? "pt-4 border-t border-[#E4E2DC]" : ""}
                >
                  <p className="font-semibold">{project.title}</p>

                  <p className="text-sm text-[#12151C]/55 mt-2">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {profile.skills?.length > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
            className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-8"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#12151C]/35 mb-4">
              Skills
            </p>

            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="font-mono text-[11px] bg-[#EAF1EE] text-[#2F5D50] px-2.5 py-1.5 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}