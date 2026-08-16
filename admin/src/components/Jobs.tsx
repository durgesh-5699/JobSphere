import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Banknote, 
  Calendar, 
  ExternalLink, 
  MoreVertical, 
  Building2,
  Clock,
  Loader2
} from 'lucide-react';
import axios from 'axios';

export default function Jobs() {
  // 1. Initialize strictly as an empty array
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/jobs`, {
        withCredentials: true
      });
      
      console.log("Backend Response Data:", response.data);
      
      // 2. Safely set state. If response.data.jobs is missing, default to []
      setJobs(response.data?.jobs || []);
      setError("");
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load job postings. Please try again.");
      // 3. Ensure it stays an array even on error!
      setJobs([]); 
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Job Postings</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Manage and monitor all roles posted across all rooms (Admin View).
          </p>
        </div>
        <button className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-white font-medium transition-all shadow-md hover:shadow-lg hover:opacity-95 bg-gradient-to-r from-[#2a4539] to-[#826227]">
          Post New Job
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#3b6051]" />
          <p>Loading jobs...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex justify-between items-center">
          <p>{error}</p>
          <button onClick={fetchJobs} className="text-sm font-bold underline hover:text-red-800">
            Retry
          </button>
        </div>
      ) : (!jobs || jobs.length === 0) ? ( // 4. THIS IS THE LINE THAT CRASHED! Now safely checking if jobs exists first.
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500">No jobs have been posted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div 
              key={job._id} 
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between lg:justify-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-gray-900">{job?.title}</h2>
                        {job?.room && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#eef2ef] text-[#3b6051] text-xs font-semibold">
                            {job.room.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm font-medium text-gray-600 gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {job?.company}
                      </div>
                    </div>
                    
                    <button className="lg:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-lg">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 max-w-3xl">
                    {job?.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-600">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {job?.location || 'Remote'}
                    </div>
                    {job?.salary && (
                      <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <Banknote className="w-3.5 h-3.5 text-[#826227]" />
                        {job.salary}
                      </div>
                    )}
                    {job?.deadline && (
                      <div className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-100">
                        <Calendar className="w-3.5 h-3.5" />
                        Deadline: {formatDate(job.deadline)}
                      </div>
                    )}
                  </div>

                  {job?.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {job.skills.map((skill: string, index: number) => (
                        <span 
                          key={index} 
                          className="px-2.5 py-1 bg-[#f6f7f6] border border-gray-200 text-gray-700 text-xs font-medium rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 min-w-[200px]">
                  <div className="text-left lg:text-right">
                    <p className="text-xs text-gray-500 font-medium">Posted by</p>
                    <p className="text-sm font-bold text-gray-900">
                      {job?.postedBy?.name || 'Unknown User'}
                    </p>
                    <div className="flex items-center justify-start lg:justify-end gap-1 mt-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(job?.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    {job?.applyLink && (
                      <a 
                        href={job.applyLink.startsWith('http') ? job.applyLink : `https://${job.applyLink}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-[#3b6051] hover:bg-[#eef2ef] rounded-lg transition-colors border border-transparent hover:border-[#3b6051]/20"
                        title="View Original Link"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                    <button className="hidden lg:flex p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}