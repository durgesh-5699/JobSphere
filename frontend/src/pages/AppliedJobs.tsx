import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import JobCard from "../components/jobCard";
import useApplications from "../context/useApplication";

export default function AppliedJobs(){
  const { applications,loading } = useApplications();

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-73px)]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
          Jobs you've applied to
        </h1>
        <p className="text-slate-500 mb-8">
          {applications.length} {applications.length === 1 ? "application" : "applications"} so far
        </p>

        {applications.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((app) => (
              <JobCard key={app.job._id} job={app.job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
            <Send size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">You haven't applied to any jobs yet.</p>
            <Link to="/" className="text-indigo-600 font-semibold hover:underline text-sm">
              Browse open roles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
