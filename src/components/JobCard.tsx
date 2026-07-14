import React, { useState } from 'react';
import { Job, Theme } from '../types';
import { cn } from '../lib/utils';
import { MapPin, Clock, DollarSign, Sparkles, BookmarkPlus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JobCardProps {
  key?: React.Key;
  job: Job;
  theme: Theme;
  onSave?: (jobId: string) => void;
  isSaved?: boolean;
  onClick?: () => void;
}

export function JobCardSkeleton({ theme }: { theme: Theme; key?: React.Key }) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={cn(
        "relative overflow-hidden",
        theme === 'neo' && "bg-white border-4 border-black p-3 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        theme === 'cottagecore' && "bg-[#fdfbf7] border border-[#d2c5b3] p-5 sm:p-8 rounded-2xl",
        theme === 'lame' && "bg-white border border-[#E4E7EB] p-3 sm:p-6 rounded-lg"
      )}
    >
      {theme === 'neo' && (
        <div className="absolute top-0 left-0 right-0 h-[6px] bg-gray-200" />
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
          <div className={cn(
            "h-8 w-3/4 bg-gray-200",
            theme === 'cottagecore' && "rounded-lg",
            theme === 'lame' && "rounded-md"
          )} />
          <div className={cn(
            "h-6 w-1/2 bg-gray-100",
            theme === 'cottagecore' && "rounded-lg",
            theme === 'lame' && "rounded-md"
          )} />
        </div>
        <div className={cn(
          "w-10 h-10 bg-gray-100",
          theme === 'neo' && "border-2 border-black",
          theme === 'cottagecore' && "rounded-full",
          theme === 'lame' && "rounded-md"
        )} />
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className={cn(
            "h-4 w-20 bg-gray-100",
            theme === 'cottagecore' && "rounded-full",
            theme === 'lame' && "rounded-md"
          )} />
        ))}
      </div>

      <div className="space-y-2 mb-6">
        <div className={cn("h-4 w-full bg-gray-100", theme === 'lame' && "rounded-md")} />
        <div className={cn("h-4 w-5/6 bg-gray-100", theme === 'lame' && "rounded-md")} />
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {[1, 2].map(i => (
            <div key={i} className={cn(
              "h-6 w-16 bg-gray-100",
              theme === 'neo' && "border-2 border-black",
              theme === 'cottagecore' && "rounded-full",
              theme === 'lame' && "rounded-md"
            )} />
          ))}
        </div>
        <div className={cn("h-4 w-16 bg-gray-100", theme === 'lame' && "rounded-md")} />
      </div>
    </motion.div>
  );
}

export function JobCard({ job, theme, onSave, isSaved, onClick }: JobCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const neoAccents = ['bg-[#00FFFF]', 'bg-[#FF00FF]', 'bg-[#CCFF00]', 'bg-[#FF3300]'];
  const accentClass = neoAccents[job.id.charCodeAt(0) % neoAccents.length];

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "relative transition-all duration-300 overflow-hidden cursor-pointer",
        theme === 'neo' && "bg-white border-4 border-black p-3 sm:p-6 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
        theme === 'cottagecore' && "bg-[#fdfbf7] border border-[#d2c5b3] p-5 sm:p-8 rounded-2xl hover:shadow-2xl hover:shadow-[#d2c5b3]/30",
        theme === 'lame' && "bg-white border border-[#E4E7EB] p-3 sm:p-6 rounded-lg hover:shadow-lg hover:border-[#00FFFF] group"
      )}
    >
      {theme === 'neo' && (
        <div className={cn("absolute top-0 left-0 right-0 h-[6px]", accentClass)} />
      )}
      {job.exclusive && (
        <div 
          className="absolute top-0 right-0 z-20"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div
            className={cn(
              "flex items-center gap-1 px-3 py-1 text-sm font-bold",
              theme === 'neo' && "bg-[#ccff00] border-l-4 border-b-4 border-black text-black uppercase tracking-wider",
              theme === 'cottagecore' && "bg-[#f4ecd8] text-[#8a9a5b] rounded-bl-2xl rounded-tr-2xl italic font-serif",
              theme === 'lame' && "bg-[#00FFFF] text-[#102A43] rounded-bl-lg rounded-tr-lg font-display-lame uppercase tracking-tighter text-xs"
            )}
          >
            <Sparkles className="w-4 h-4" />
            Exclusive
          </div>

          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={cn(
                  "absolute top-full right-0 mt-2 w-64 p-4 z-30 shadow-xl pointer-events-none",
                  theme === 'neo' && "bg-black text-white font-mono text-xs border-2 border-[#ccff00]",
                  theme === 'cottagecore' && "bg-[#fdfbf7] text-[#5A5A40] font-serif italic text-sm border border-[#d2c5b3] rounded-xl",
                  theme === 'lame' && "bg-[#102A43] text-white font-display-lame text-xs rounded-md border border-[#334E68]"
                )}
              >
                <div className="flex gap-2">
                  <Info className={cn("w-4 h-4 shrink-0", theme === 'neo' ? "text-[#ccff00]" : theme === 'lame' ? "text-[#00FFFF]" : "text-[#8a9a5b]")} />
                  <p>
                    Verified role with direct access to the studio. No spam, no bidding wars, just high-signal creative opportunities.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3
            className={cn(
              "text-2xl mb-1",
              theme === 'neo' && "font-display-neo font-bold uppercase tracking-tight text-black",
              theme === 'cottagecore' && "font-display-cottage font-semibold text-[#2d4a22]",
              theme === 'lame' && "font-display-lame font-bold tracking-tight text-[#102A43] group-hover:text-[#004488]"
            )}
          >
            {job.title}
          </h3>
          <p
            className={cn(
              "text-lg",
              theme === 'neo' && "font-mono font-medium text-gray-600",
              theme === 'cottagecore' && "font-sans text-[#c86b5e]",
              theme === 'lame' && "font-display-lame font-medium text-[#486581]"
            )}
          >
            {job.company}
          </p>
        </div>
        
        {onSave && !isSaved && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave(job.id);
            }}
            className={cn(
              "p-2.5 transition-all duration-200 shadow-sm",
              theme === 'neo' && "border-2 border-black bg-white hover:bg-[#ff00ff] hover:text-white hover:scale-110 active:scale-95 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              theme === 'cottagecore' && "text-[#8a9a5b] bg-white border border-[#d2c5b3] hover:bg-[#f4ecd8] hover:text-[#2d4a22] rounded-full hover:scale-110 active:scale-95 hover:shadow-md",
              theme === 'lame' && "text-[#486581] bg-[#F0F4F8] border border-[#D9E2EC] hover:text-[#00FFFF] hover:bg-[#102A43] hover:border-[#00FFFF] rounded-md hover:scale-110 active:scale-95 hover:shadow-lg"
            )}
            title="Save to Board"
          >
            <BookmarkPlus className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className={cn(
        "flex flex-wrap gap-4 mb-6 text-sm",
        theme === 'lame' ? "text-[#627D98]" : "text-gray-600"
      )}>
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {job.location}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {job.type}
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          {job.salary}
        </div>
      </div>

      <p className={cn(
        "mb-6 line-clamp-2",
        theme === 'neo' && "text-black",
        theme === 'cottagecore' && "text-gray-700",
        theme === 'lame' && "text-[#334E68] font-display-lame leading-relaxed"
      )}>
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "px-3 py-1 text-xs font-medium",
                theme === 'neo' && "border-2 border-black bg-gray-100 uppercase",
                theme === 'cottagecore' && "bg-[#f4ecd8] text-[#5A5A40] rounded-full",
                theme === 'lame' && "bg-[#F0F4F8] text-[#486581] rounded-md border border-[#D9E2EC]"
              )}
            >
              {tag}
            </span>
          ))}
        </div>
        <span className={cn(
          "text-xs font-medium",
          theme === 'lame' ? "text-[#9FB3C8]" : "text-gray-500"
        )}>{job.postedAt}</span>
      </div>
    </motion.div>
  );
}
