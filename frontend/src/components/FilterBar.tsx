import { MapPin, Search, SlidersHorizontal } from "lucide-react";

interface FilterBarProps{
    search:string,
    setSearch:(val:string)=>void,
    location:string,
    setLocation:(val:string)=>void,
    locations:string[]
}

export default function FilterBar({search,setSearch,location,setLocation,locations}:FilterBarProps){
    return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      <div className="relative flex-1">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by role, company, or skill..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="relative sm:w-48">
        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
        >
          <option value="">All locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <button className="hidden sm:flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-slate-300 transition-colors">
        <SlidersHorizontal size={16} />
        Filters
      </button>
    </div>
  );
}