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
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#12151C]/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by role, company, or skill..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-[#E4E2DC] rounded-xl text-sm text-[#12151C] placeholder:text-[#12151C]/30 focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow"
        />
      </div>

      <div className="relative sm:w-48">
        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#12151C]/30" />
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-[#E4E2DC] rounded-xl text-sm text-[#12151C]/75 focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow appearance-none cursor-pointer"
        >
          <option value="">All locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <button className="hidden sm:flex items-center gap-2 px-4 py-3 bg-white border border-[#E4E2DC] rounded-xl text-sm font-medium text-[#12151C]/60 hover:border-[#2F5D50]/30 hover:text-[#2F5D50] transition-colors">
        <SlidersHorizontal size={16} />
        Filters
      </button>
    </div>
  );
}