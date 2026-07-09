import {
  Briefcase,
  Building2,
  IndianRupee,
  LinkIcon,
  MapPin,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { createJob } from "../services/jobService";
import { parseJobInput } from "../services/aiService";
import { fetchMyRooms, fetchPublicRooms } from "../services/roomService";
import type { Room } from "../types/room.types";

interface JobFormData {
  title: string;
  company: string;
  description: string;
  applyLink: string;
  location: string;
  salary: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const fieldClass =
  "w-full pl-10 pr-4 py-2.5 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl text-sm text-[#12151C] placeholder:text-[#12151C]/30 focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow";

const labelClass = "block text-sm font-medium text-[#12151C]/70 mb-1.5";

export default function PostJob() {
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    company: "",
    description: "",
    applyLink: "",
    location: "",
    salary: "",
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [rawText,setRawText] = useState("");
  const [aiLoading,setAiLoading] = useState(false);
  const [aiError,setAiError] = useState("");

  const [duplicateJobId,setDuplicateJobId] = useState<string | null>(null);

  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchPublicRooms(), fetchMyRooms()])
      .then(([pub, mine]) => {
        setPublicRooms(pub);
        setMyRooms(mine.filter((r) => !r.isPublic));
      })
      .catch(console.error);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAutoFill = async()=>{
    if(rawText.trim().length<10){
      setAiError("Paste job details or a link.");
      return;
    }

    setAiError("");
    setAiLoading(true);
    try{
      const parsed = await parseJobInput(rawText);
      setFormData({
        title: parsed.title,
        company: parsed.company,
        description: parsed.description,
        applyLink: parsed.applyLink,
        location: parsed.location,
        salary: parsed.salary,
      })
      setSkills(parsed.skills || []);
    }catch(err:any){
       setAiError(err.response?.data?.message || "Couldn't parse that. Try filling manually.");
    }finally{
      setAiLoading(false);
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setDuplicateJobId(null);

    if (skills.length === 0) {
      setError("Add at least one skill.");
      return;
    }
    setLoading(true);
    try{
      await createJob({...formData,skills, room:selectedRoom});
      navigate("/");
    }catch(err:any){
      if(err.response?.status === 409 && err.response?.data?.existingJobId){
        setError(`This job is already posted on jobSphere. View it in the dashboard.`);
        setDuplicateJobId(err.response.data.existingJobId);
      }else{
        setError(err.response?.data?.message || "Failed to post job. Try again.");
      }
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F6F5F2] min-h-[calc(100vh-73px)]">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
          <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.2em] uppercase text-[#2F5D50] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F5D50]" />
            jobSphere
          </span>
          <h1 className="font-display text-3xl font-semibold text-[#12151C] tracking-tight mb-2">
            Share an opening
          </h1>
          <p className="text-[#12151C]/55 mb-8">
            Spotted a role? Post it so your batchmates don't miss it.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={1}
          className="relative bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-8 mb-6 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#2F5D50] via-[#C08B2C] to-[#2F5D50]" />
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-[#C08B2C]" />
            <h2 className="font-display font-semibold text-[#12151C] tracking-tight">Auto-fill with AI</h2>
          </div>
          <p className="text-sm text-[#12151C]/55 mb-4">
            Paste the job info you found, or just paste the job link — AI will
            fill the form below for you.
          </p>

          <AnimatePresence>
            {aiError && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="text-sm text-[#8C2F26] bg-[#FBEAE8] border border-[#F0CFC9] rounded-lg px-4 py-2.5">
                  {aiError}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

           <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={5}
            placeholder="Paste raw job text, or paste a job posting link (e.g. https://company.com/careers/role)"
            className="w-full px-4 py-3 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl text-sm text-[#12151C] placeholder:text-[#12151C]/30 focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow resize-none mb-3"
          />

          <button
            type="button"
            onClick={handleAutoFill}
            disabled={aiLoading}
            className="flex items-center gap-2 bg-[#12151C] hover:bg-[#2F5D50] text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <Sparkles size={15} className={aiLoading ? "animate-pulse" : ""} />
            {aiLoading ? "Reading..." : "Auto-fill form"}
          </button>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="text-sm text-[#8C2F26] bg-[#FBEAE8] border border-[#F0CFC9] rounded-lg px-4 py-2.5 flex items-center justify-between gap-3">
                <span>{error}</span>
                {duplicateJobId && (
                  <Link
                    to={`/jobs/${duplicateJobId}`}
                    className="font-semibold text-[#8C2F26] hover:underline whitespace-nowrap"
                  >
                    View here →
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          variants={fadeUp} initial="hidden" animate="show" custom={2}
          onSubmit={handleSubmit}
          className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div>
            <label className={labelClass}>Post to</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl text-sm text-[#12151C] focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow"
            >
              <option value="">Select where to post</option>

              {publicRooms.length > 0 && (
                <optgroup label="🌐 Public Rooms">
                  {publicRooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {myRooms.length > 0 && (
                <optgroup label="🔒 My Private Rooms">
                  {myRooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <p className="text-xs text-[#12151C]/35 mt-1.5">
              Public rooms are visible to everyone. Private rooms only to approved members.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Job title</label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12151C]/30" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="SDE 1"
                  className={fieldClass}
                />
              </div>
            </div>
             <div>
              <label className={labelClass}>Company</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12151C]/30" />
                  <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  placeholder="Razorpay"
                  className={fieldClass}
                />
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Location</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12151C]/30" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Bangalore / Remote"
                  className={fieldClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>
                Salary <span className="text-[#12151C]/35 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12151C]/30" />
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="8 LPA"
                  className={fieldClass}
                />
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>Apply link</label>
            <div className="relative">
              <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12151C]/30" />
              <input
                type="url"
                name="applyLink"
                value={formData.applyLink}
                onChange={handleChange}
                required
                placeholder="https://company.com/careers/role-id"
                className={fieldClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Skills required</label>
            <div className="flex flex-wrap items-center gap-2 w-full px-3 py-2.5 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl focus-within:ring-2 focus-within:ring-[#2F5D50]/40 focus-within:border-[#2F5D50] transition-all">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1 font-mono text-[11px] font-medium text-[#2F5D50] bg-[#EAF1EE] pl-2 pr-1 py-1 rounded-md"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:bg-[#D3E3DC] rounded-full p-0.5 transition-colors"
                  >
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
                className="flex-1 min-w-[120px] bg-transparent text-sm text-[#12151C] placeholder:text-[#12151C]/30 focus:outline-none py-0.5"
              />
            </div>
            <p className="text-xs text-[#12151C]/35 mt-1.5">
              Press Enter or comma to add a skill
            </p>
          </div>
          <div>
            <label className={labelClass}>Job description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Paste or write the full job description here..."
              className="w-full px-4 py-3 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl text-sm text-[#12151C] placeholder:text-[#12151C]/30 focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow resize-none"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#12151C] hover:bg-[#2F5D50] text-white font-semibold text-sm py-3.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post job"}
            {!loading && <Send size={16} />}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );


}