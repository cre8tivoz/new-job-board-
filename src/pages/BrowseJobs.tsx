import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Job, Theme, SavedSearch } from '../types';
import { JobCard, JobCardSkeleton } from '../components/JobCard';
import { cn } from '../lib/utils';
import { Search, Filter, MapPin, ChevronDown, Briefcase, Tag, ChevronLeft, ChevronRight, Bookmark, X, ArrowUpDown } from 'lucide-react';

const JOBS_PER_PAGE = 9;

interface BrowseJobsProps {
  jobs: Job[];
  theme: Theme;
  onSaveJob: (jobId: string) => void;
  savedJobIds: string[];
  isLoading?: boolean;
  error?: string | null;
}

export function BrowseJobs({ jobs, theme, onSaveJob, savedJobIds, isLoading, error }: BrowseJobsProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedTag, setSelectedTag] = useState('All Tags');
  const [sortBy, setSortBy] = useState<'Newest First' | 'Salary High-Low' | 'Most Relevant'>('Most Relevant');
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    const saved = localStorage.getItem('creative_saved_searches');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSearchChange = (value: string) => {
    if (value.length > 100) {
      setSearchError('Search query is too long (max 100 characters)');
      return;
    }

    // Basic sanitization: block potential script tags or suspicious characters
    const maliciousPattern = /[<>]/;
    if (maliciousPattern.test(value)) {
      setSearchError('Invalid characters detected in search');
      return;
    }

    setSearchError(null);
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesQuery = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'All Cities' || job.location.includes(selectedCity);
    const matchesType = selectedType === 'All Types' || job.type === selectedType;
    const matchesTag = selectedTag === 'All Tags' || job.tags.includes(selectedTag);
    return matchesQuery && matchesCity && matchesType && matchesTag;
  }).sort((a, b) => {
    if (sortBy === 'Newest First') {
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    }
    if (sortBy === 'Salary High-Low') {
      const getSalaryValue = (s: string) => {
        const match = s.match(/\$(\d+)k/);
        return match ? parseInt(match[1]) : 0;
      };
      return getSalaryValue(b.salary) - getSalaryValue(a.salary);
    }
    if (sortBy === 'Most Relevant' && searchQuery) {
      const getRelevance = (job: Job) => {
        const q = searchQuery.toLowerCase();
        let score = 0;
        if (job.title.toLowerCase().includes(q)) score += 10;
        if (job.company.toLowerCase().includes(q)) score += 5;
        if (job.description.toLowerCase().includes(q)) score += 2;
        return score;
      };
      return getRelevance(b) - getRelevance(a);
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveSearch = () => {
    const newSearch: SavedSearch = {
      id: crypto.randomUUID(),
      name: searchQuery || `${selectedCity} • ${selectedType} • ${selectedTag}`,
      query: searchQuery,
      city: selectedCity,
      type: selectedType,
      tag: selectedTag,
      timestamp: Date.now()
    };
    const updated = [newSearch, ...savedSearches].slice(0, 5); // Keep last 5
    setSavedSearches(updated);
    localStorage.setItem('creative_saved_searches', JSON.stringify(updated));
  };

  const applySavedSearch = (saved: SavedSearch) => {
    setSearchQuery(saved.query);
    setSelectedCity(saved.city);
    setSelectedType(saved.type);
    setSelectedTag(saved.tag);
    setCurrentPage(1);
  };

  const removeSavedSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('creative_saved_searches', JSON.stringify(updated));
  };

  return (
    <div className="space-y-12 pb-24">
      <div className={cn(
        "max-w-3xl",
        theme === 'neo' ? "" : "text-center mx-auto"
      )}>
        <h2 className={cn(
          "text-5xl md:text-7xl mb-6",
          theme === 'neo' && "font-display-neo font-black uppercase leading-none tracking-tighter",
          theme === 'cottagecore' && "font-display-cottage font-bold leading-tight text-[#2d4a22]",
          theme === 'lame' && "font-display-lame font-black tracking-tight text-[#102A43]"
        )}>
          {theme === 'neo' && "Find Your Next Creative Role."}
          {theme === 'cottagecore' && "Seek Thy Creative Calling."}
          {theme === 'lame' && "Strategic Career Opportunities."}
        </h2>
        <p className={cn(
          "text-xl md:text-2xl",
          theme === 'neo' && "font-mono font-medium text-gray-600",
          theme === 'cottagecore' && "font-serif italic text-[#c86b5e]",
          theme === 'lame' && "font-display-lame font-medium text-[#486581]"
        )}>
          {theme === 'neo' && "The no-BS job board for designers, makers & digital builders across Australia. Verified roles. Zero noise."}
          {theme === 'cottagecore' && "A curated scroll of fine creative roles, handpicked for makers, designers & digital artisans across the great southern land."}
          {theme === 'lame' && "A comprehensive database of high-impact professional vacancies within the creative industries sector."}
        </p>
      </div>

      <div className={cn(
        "flex flex-col lg:flex-row gap-4 p-4",
        theme === 'neo' && "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        theme === 'cottagecore' && "bg-[#fdfbf7] rounded-2xl border border-[#d2c5b3]",
        theme === 'lame' && "bg-white rounded-lg border border-[#D9E2EC] shadow-sm"
      )}>
        <div className="flex-1 relative">
          <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5", theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#627D98]" : "text-[#8a9a5b]")} />
          <input 
            type="text" 
            placeholder="Search roles, skills, or studios..." 
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={cn(
              "w-full pl-12 pr-4 py-3 outline-none transition-all",
              theme === 'neo' && "font-mono border-2 border-black bg-gray-50 focus:bg-white",
              theme === 'cottagecore' && "font-serif rounded-xl border border-[#d2c5b3] bg-white",
              theme === 'lame' && "font-display-lame border border-[#BCCCDC] bg-[#F0F4F8] focus:bg-white rounded-md",
              searchError && (
                theme === 'neo' ? "border-[#ff00ff] bg-red-50" :
                theme === 'cottagecore' ? "border-red-300 bg-red-50" :
                "border-red-400 bg-red-50"
              )
            )}
          />
          {searchError && (
            <div className={cn(
              "absolute left-0 -bottom-6 text-xs font-bold",
              theme === 'neo' && "font-mono text-[#ff00ff] uppercase",
              theme === 'cottagecore' && "font-serif italic text-red-600",
              theme === 'lame' && "font-display-lame text-red-500"
            )}>
              {searchError}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <div className="relative flex-1 sm:flex-none">
            <MapPin className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none", theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#627D98]" : "text-[#8a9a5b]")} />
            <select 
              value={selectedCity}
              onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
              className={cn(
                "w-full sm:w-auto pl-12 pr-12 py-3 outline-none appearance-none cursor-pointer transition-all",
                theme === 'neo' && "font-mono border-2 border-black bg-gray-50 hover:bg-white focus:bg-white",
                theme === 'cottagecore' && "font-serif rounded-xl border border-[#d2c5b3] bg-white hover:bg-[#fdfbf7]",
                theme === 'lame' && "font-display-lame border border-[#BCCCDC] bg-[#F0F4F8] hover:bg-white focus:bg-white rounded-md"
              )}
            >
              <option>All Cities</option>
              <option>Melbourne</option>
              <option>Sydney</option>
              <option>Brisbane</option>
            </select>
            <ChevronDown className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none", theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#627D98]" : "text-[#8a9a5b]")} />
          </div>

          <div className="relative flex-1 sm:flex-none">
            <Briefcase className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none", theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#627D98]" : "text-[#8a9a5b]")} />
            <select 
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
              className={cn(
                "w-full sm:w-auto pl-12 pr-12 py-3 outline-none appearance-none cursor-pointer transition-all",
                theme === 'neo' && "font-mono border-2 border-black bg-gray-50 hover:bg-white focus:bg-white",
                theme === 'cottagecore' && "font-serif rounded-xl border border-[#d2c5b3] bg-white hover:bg-[#fdfbf7]",
                theme === 'lame' && "font-display-lame border border-[#BCCCDC] bg-[#F0F4F8] hover:bg-white focus:bg-white rounded-md"
              )}
            >
              <option>All Types</option>
              <option>Full-time</option>
              <option>Contract</option>
              <option>Freelance</option>
              <option>Part-time</option>
            </select>
            <ChevronDown className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none", theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#627D98]" : "text-[#8a9a5b]")} />
          </div>

          <div className="relative flex-1 sm:flex-none">
            <Tag className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none", theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#627D98]" : "text-[#8a9a5b]")} />
            <select 
              value={selectedTag}
              onChange={(e) => { setSelectedTag(e.target.value); setCurrentPage(1); }}
              className={cn(
                "w-full sm:w-auto pl-12 pr-12 py-3 outline-none appearance-none cursor-pointer transition-all",
                theme === 'neo' && "font-mono border-2 border-black bg-gray-50 hover:bg-white focus:bg-white",
                theme === 'cottagecore' && "font-serif rounded-xl border border-[#d2c5b3] bg-white hover:bg-[#fdfbf7]",
                theme === 'lame' && "font-display-lame border border-[#BCCCDC] bg-[#F0F4F8] hover:bg-white focus:bg-white rounded-md"
              )}
            >
              <option>All Tags</option>
              <option>Branding</option>
              <option>Figma</option>
              <option>Animation</option>
              <option>UI/UX</option>
              <option>Motion</option>
              <option>Web Design</option>
            </select>
            <ChevronDown className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none", theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#627D98]" : "text-[#8a9a5b]")} />
          </div>

          <div className="relative flex-1 sm:flex-none">
            <ArrowUpDown className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none", theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#627D98]" : "text-[#8a9a5b]")} />
            <select 
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value as any); setCurrentPage(1); }}
              className={cn(
                "w-full sm:w-auto pl-12 pr-12 py-3 outline-none appearance-none cursor-pointer transition-all",
                theme === 'neo' && "font-mono border-2 border-black bg-gray-50 hover:bg-white focus:bg-white",
                theme === 'cottagecore' && "font-serif rounded-xl border border-[#d2c5b3] bg-white hover:bg-[#fdfbf7]",
                theme === 'lame' && "font-display-lame border border-[#BCCCDC] bg-[#F0F4F8] hover:bg-white focus:bg-white rounded-md"
              )}
            >
              <option>Most Relevant</option>
              <option>Newest First</option>
              <option>Salary High-Low</option>
            </select>
            <ChevronDown className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none", theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#627D98]" : "text-[#8a9a5b]")} />
          </div>

          <button 
            onClick={handleSaveSearch}
            className={cn(
              "px-6 py-3 flex items-center justify-center gap-2 transition-all flex-1 sm:flex-none",
              theme === 'neo' && "bg-white text-black font-display-neo uppercase border-2 border-black hover:bg-black hover:text-white",
              theme === 'cottagecore' && "bg-white text-[#5A5A40] rounded-xl border border-[#d2c5b3] font-serif hover:bg-[#f4ecd8]",
              theme === 'lame' && "bg-[#102A43] text-white rounded-md font-display-lame font-bold hover:bg-[#243B53]"
            )}
          >
            <Bookmark className={cn("w-4 h-4", theme === 'lame' && "text-[#00FFFF]")} /> Save Search
          </button>
        </div>
      </div>

      {savedSearches.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <span className={cn(
            "text-sm uppercase tracking-wider font-bold",
            theme === 'neo' && "font-mono text-black",
            theme === 'cottagecore' && "font-serif text-[#8a9a5b]",
            theme === 'lame' && "font-display-lame text-[#627D98]"
          )}>
            Saved Searches:
          </span>
          {savedSearches.map((saved) => (
            <div 
              key={saved.id}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 transition-all group",
                theme === 'neo' && "bg-white border-2 border-black hover:bg-black hover:text-white",
                theme === 'cottagecore' && "bg-[#f4ecd8] rounded-full border border-[#d2c5b3] hover:bg-[#e8dec8]",
                theme === 'lame' && "bg-white rounded-md border border-[#D9E2EC] hover:border-[#00FFFF] hover:shadow-sm"
              )}
            >
              <button 
                onClick={() => applySavedSearch(saved)}
                className={cn(
                  "text-sm font-medium",
                  theme === 'neo' && "font-mono",
                  theme === 'cottagecore' && "font-serif",
                  theme === 'lame' && "font-display-lame text-[#102A43]"
                )}
              >
                {saved.name}
              </button>
              <button 
                onClick={() => removeSavedSearch(saved.id)}
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className={cn("w-3 h-3", theme === 'lame' && "text-red-500")} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={cn(
        "p-4 mb-6 flex justify-between items-center",
        theme === 'neo' && "bg-black text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        theme === 'cottagecore' && "bg-[#fdfbf7] text-[#2d4a22] border border-[#d2c5b3] rounded-2xl",
        theme === 'lame' && "bg-white text-[#102A43] border border-[#D9E2EC] rounded-md shadow-sm"
      )}>
        <h2 className={cn(
          theme === 'neo' && "font-display-neo text-3xl uppercase tracking-widest",
          theme === 'cottagecore' && "font-display-cottage text-2xl font-bold",
          theme === 'lame' && "font-display-lame text-xl font-bold tracking-tight"
        )}>
          {theme === 'lame' ? 'Current Vacancies' : 'Latest Roles'}
        </h2>
        <div className={cn(
          "text-sm",
          theme === 'neo' && "font-mono uppercase text-[#00FFFF]",
          theme === 'cottagecore' && "font-serif italic text-[#c86b5e]",
          theme === 'lame' && "font-display-lame font-medium text-[#627D98]"
        )}>
          {isLoading ? 'Fetching Live Data...' : `${filteredJobs.length} ${filteredJobs.length === 1 ? 'Role' : 'Roles'} Found`}
        </div>
      </div>

      {error && (
        <div className={cn(
          "mb-8 p-4 flex items-start gap-3",
          theme === 'neo' && "bg-[#ff00ff] text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          theme === 'cottagecore' && "bg-[#f4ecd8] text-[#8a9a5b] border border-[#d2c5b3] rounded-xl",
          theme === 'lame' && "bg-red-50 text-red-800 border border-red-200 rounded-md"
        )}>
          <div className="mt-0.5">
            <X className="w-5 h-5" />
          </div>
          <div>
            <h3 className={cn(
              "font-bold mb-1",
              theme === 'neo' && "font-display-neo uppercase",
              theme === 'cottagecore' && "font-serif",
              theme === 'lame' && "font-display-lame"
            )}>
              Live Data Unavailable
            </h3>
            <p className={cn(
              "text-sm",
              theme === 'neo' && "font-mono",
              theme === 'cottagecore' && "font-serif italic",
              theme === 'lame' && "font-display-lame"
            )}>
              {error}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-12">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className={cn(
              "w-12 h-12 border-4 border-t-transparent rounded-full animate-spin",
              theme === 'neo' && "border-black",
              theme === 'cottagecore' && "border-[#8a9a5b]",
              theme === 'lame' && "border-[#00FFFF]"
            )} />
            <p className={cn(
              "text-lg",
              theme === 'neo' && "font-mono uppercase font-bold",
              theme === 'cottagecore' && "font-serif italic text-[#5A5A40]",
              theme === 'lame' && "font-display-lame font-medium text-[#486581]"
            )}>
              Scraping the latest creative roles across Australia...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <JobCardSkeleton key={i} theme={theme} />
            ))}
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className={cn(
          "flex flex-col items-center justify-center py-24 px-4 text-center space-y-6",
          theme === 'neo' && "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
          theme === 'cottagecore' && "bg-[#fdfbf7] rounded-3xl border border-[#d2c5b3]",
          theme === 'lame' && "bg-white rounded-lg border border-[#D9E2EC] shadow-sm"
        )}>
          <div className={cn(
            "w-20 h-20 flex items-center justify-center rounded-full",
            theme === 'neo' && "bg-black text-[#00FFFF]",
            theme === 'cottagecore' && "bg-[#f4ecd8] text-[#c86b5e]",
            theme === 'lame' && "bg-[#F0F4F8] text-[#627D98]"
          )}>
            <Search className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className={cn(
              "text-3xl",
              theme === 'neo' && "font-display-neo uppercase font-black",
              theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]",
              theme === 'lame' && "font-display-lame font-black tracking-tight text-[#102A43]"
            )}>
              No Roles Found
            </h3>
            <p className={cn(
              "text-lg max-w-md mx-auto",
              theme === 'neo' && "font-mono",
              theme === 'cottagecore' && "font-serif italic",
              theme === 'lame' && "font-display-lame text-[#486581]"
            )}>
              {searchQuery 
                ? `We couldn't find any roles matching "${searchQuery}". Try adjusting your filters or searching for something else.`
                : "No roles match your current filters. Try broadening your search to find more opportunities."}
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCity('All Cities');
              setSelectedType('All Types');
              setSelectedTag('All Tags');
              setCurrentPage(1);
            }}
            className={cn(
              "px-8 py-3 transition-all",
              theme === 'neo' && "bg-[#ccff00] text-black font-display-neo uppercase border-4 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              theme === 'cottagecore' && "bg-[#2d4a22] text-white rounded-full font-serif hover:bg-[#1a2e13]",
              theme === 'lame' && "bg-[#102A43] text-white rounded-md font-display-lame font-bold hover:bg-[#243B53]"
            )}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                theme={theme}
                onSave={onSaveJob}
                isSaved={savedJobIds.includes(job.id)}
                onClick={() => navigate('/jobs/' + job.id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "p-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed",
              theme === 'neo' && "border-2 border-black bg-white hover:bg-black hover:text-white",
              theme === 'cottagecore' && "rounded-full border border-[#d2c5b3] bg-white text-[#5A5A40] hover:bg-[#f4ecd8]",
              theme === 'lame' && "rounded-md border border-[#D9E2EC] bg-white text-[#102A43] hover:border-[#00FFFF]"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center transition-all",
                  currentPage === page
                    ? theme === 'neo' 
                      ? "bg-black text-white border-2 border-black font-display-neo" 
                      : theme === 'cottagecore'
                        ? "bg-[#5A5A40] text-white rounded-full font-serif"
                        : "bg-[#102A43] text-white rounded-md font-display-lame"
                    : theme === 'neo'
                      ? "bg-white text-black border-2 border-black hover:bg-gray-100 font-display-neo"
                      : theme === 'cottagecore'
                        ? "bg-white text-[#5A5A40] border border-[#d2c5b3] rounded-full hover:bg-[#f4ecd8] font-serif"
                        : "bg-white text-[#102A43] border border-[#D9E2EC] rounded-md hover:border-[#00FFFF] font-display-lame"
                )}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              "p-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed",
              theme === 'neo' && "border-2 border-black bg-white hover:bg-black hover:text-white",
              theme === 'cottagecore' && "rounded-full border border-[#d2c5b3] bg-white text-[#5A5A40] hover:bg-[#f4ecd8]",
              theme === 'lame' && "rounded-md border border-[#D9E2EC] bg-white text-[#102A43] hover:border-[#00FFFF]"
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
      </>
      )}
    </div>
  );
}
