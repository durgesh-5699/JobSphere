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
        // My private rooms — public wale duplicate na ho isliye filter kiya
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
      await createJob({...formData,skills});
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
    <div className="bg-slate-50 min-h-[calc(100vh-73px)]">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <span className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4">
          jobSphere
        </span>
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
          Share an opening
        </h1>
        <p className="text-slate-500 mb-8">
          Spotted a role? Post it so your batchmates don't miss it.
        </p>

        {/* AI Auto-fill box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-amber-500" />
            <h2 className="font-display font-bold text-slate-900">Auto-fill with AI</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Paste the job info you found, or just paste the job link — AI will
            fill the form below for you.
          </p>

          {aiError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {aiError}
            </div>
          )}

           <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={5}
            placeholder="Paste raw job text, or paste a job posting link (e.g. https://company.com/careers/role)"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none mb-3"
          />

          <button
            type="button"
            onClick={handleAutoFill}
            disabled={aiLoading}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <Sparkles size={16} />
            {aiLoading ? "Reading..." : "Auto-fill form"}
          </button>
        </div>

        {error && (
          <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 flex items-center justify-between gap-3">
            <span>{error}</span>
            {duplicateJobId && (
              <Link
                to={`/jobs/${duplicateJobId}`}
                className="font-semibold text-red-700 hover:underline whitespace-nowrap"
              >
                View here →
              </Link>
            )}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5"
        >
          {/* Room selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Post to
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
            <p className="text-xs text-slate-400 mt-1.5">
              Public rooms are visible to everyone. Private rooms only to approved members.
            </p>
          </div>
          {/* Title + Company */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Job title
              </label>
              <div className="relative">
                <Briefcase
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="SDE 1"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Company
              </label>
              <div className="relative">
                <Building2
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                  <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  placeholder="Razorpay"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
          {/* Location + Salary */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Bangalore / Remote"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Salary <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <IndianRupee
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="8 LPA"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
          {/* Apply link */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Apply link
            </label>
            <div className="relative">
              <LinkIcon
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="url"
                name="applyLink"
                value={formData.applyLink}
                onChange={handleChange}
                required
                placeholder="https://company.com/careers/role-id"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          {/* Skills — tag input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Skills required
            </label>
            <div className="flex flex-wrap items-center gap-2 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 pl-2.5 pr-1.5 py-1 rounded-full"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:bg-indigo-100 rounded-full p-0.5 transition-colors"
                  >
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
                className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none py-0.5"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Press Enter or comma to add a skill
            </p>
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Job description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Paste or write the full job description here..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post job"}
            {!loading && <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );


}
