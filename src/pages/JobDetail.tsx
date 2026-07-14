import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Job, Theme } from '../types';
import { cn } from '../lib/utils';
import { MapPin, Briefcase, Tag, Calendar, ArrowLeft, Bookmark, Share2, ExternalLink, Building2, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface JobDetailProps {
  jobs: Job[];
  theme: Theme;
  onSaveJob: (jobId: string) => void;
  savedJobIds: string[];
}

export function JobDetail({ jobs, theme, onSaveJob, savedJobIds }: JobDetailProps) {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const job = jobs.find(j => j.id === jobId);
  const isSaved = job ? savedJobIds.includes(job.id) : false;

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <h2 className={cn(
          "text-3xl",
          theme === 'neo' && "font-display-neo font-black uppercase tracking-tighter",
          theme === 'cottagecore' && "font-display-cottage font-bold",
          theme === 'lame' && "font-display-lame font-bold"
        )}>
          Job Not Found
        </h2>
        <button 
          onClick={() => navigate(-1)}
          className={cn(
            "flex items-center gap-2 px-6 py-3",
            theme === 'neo' && "bg-black text-white border-4 border-black hover:bg-white hover:text-black transition-all",
            theme === 'cottagecore' && "bg-[#8a9a5b] text-white rounded-xl hover:bg-[#7a8a4b]",
            theme === 'lame' && "bg-[#00FFFF] text-[#102A43] font-bold rounded-md hover:opacity-90"
          )}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-24"
    >
      <button 
        onClick={() => navigate(-1)}
        className={cn(
          "flex items-center gap-2 mb-8 group",
          theme === 'neo' && "font-mono uppercase font-bold text-black",
          theme === 'cottagecore' && "font-serif italic text-[#c86b5e]",
          theme === 'lame' && "font-display-lame font-medium text-[#627D98]"
        )}
      >
        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        Back to Listings
      </button>

      <div className={cn(
        "p-8 relative overflow-hidden",
        theme === 'neo' && "bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
        theme === 'cottagecore' && "bg-[#fdfbf7] border border-[#d2c5b3] rounded-3xl",
        theme === 'lame' && "bg-white border border-[#D9E2EC] rounded-xl shadow-sm"
      )}>
        {job.exclusive && (
          <div className={cn(
            "absolute top-0 right-0 px-6 py-2 text-xs font-bold",
            theme === 'neo' && "bg-[#00FFFF] text-black border-l-4 border-b-4 border-black uppercase",
            theme === 'cottagecore' && "bg-[#c86b5e] text-white rounded-bl-2xl",
            theme === 'lame' && "bg-[#F0F4F8] text-[#102A43] rounded-bl-xl"
          )}>
            EXCLUSIVE ROLE
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="space-y-4">
            <h1 className={cn(
              "text-4xl md:text-6xl",
              theme === 'neo' && "font-display-neo font-black uppercase tracking-tighter leading-none",
              theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]",
              theme === 'lame' && "font-display-lame font-black text-[#102A43]"
            )}>
              {job.title}
            </h1>
            
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-2">
                <Building2 className={cn("w-5 h-5", theme === 'neo' ? "text-black" : "text-[#627D98]")} />
                <span className={cn(
                  "text-xl",
                  theme === 'neo' && "font-mono font-bold",
                  theme === 'cottagecore' && "font-serif italic",
                  theme === 'lame' && "font-display-lame font-semibold"
                )}>
                  {job.company}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className={cn("w-5 h-5", theme === 'neo' ? "text-black" : "text-[#627D98]")} />
                <span className={cn(
                  "text-lg",
                  theme === 'neo' && "font-mono",
                  theme === 'cottagecore' && "font-serif",
                  theme === 'lame' && "font-display-lame"
                )}>
                  {job.location}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => onSaveJob(job.id)}
              className={cn(
                "p-4 border-4 border-black transition-all",
                theme === 'neo' && (isSaved ? "bg-[#ff00ff] text-white" : "bg-white hover:bg-gray-100"),
                theme === 'cottagecore' && "rounded-2xl border-[#d2c5b3] bg-white",
                theme === 'lame' && "rounded-lg border-[#D9E2EC] bg-white"
              )}
            >
              <Bookmark className={cn("w-6 h-6", isSaved && "fill-current")} />
            </button>
            <button className={cn(
              "p-4 border-4 border-black transition-all",
              theme === 'neo' && "bg-white hover:bg-gray-100",
              theme === 'cottagecore' && "rounded-2xl border-[#d2c5b3] bg-white",
              theme === 'lame' && "rounded-lg border-[#D9E2EC] bg-white"
            )}>
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className={cn(
            "p-4",
            theme === 'neo' && "bg-gray-50 border-2 border-black",
            theme === 'cottagecore' && "bg-[#f4ecd8] rounded-xl",
            theme === 'lame' && "bg-[#F0F4F8] rounded-lg"
          )}>
            <div className="flex items-center gap-2 text-sm opacity-60 mb-1">
              <Briefcase className="w-4 h-4" />
              Employment Type
            </div>
            <div className="font-bold">{job.type}</div>
          </div>
          <div className={cn(
            "p-4",
            theme === 'neo' && "bg-gray-50 border-2 border-black",
            theme === 'cottagecore' && "bg-[#f4ecd8] rounded-xl",
            theme === 'lame' && "bg-[#F0F4F8] rounded-lg"
          )}>
            <div className="flex items-center gap-2 text-sm opacity-60 mb-1">
              <DollarSign className="w-4 h-4" />
              Salary Range
            </div>
            <div className="font-bold">{job.salary}</div>
          </div>
          <div className={cn(
            "p-4",
            theme === 'neo' && "bg-gray-50 border-2 border-black",
            theme === 'cottagecore' && "bg-[#f4ecd8] rounded-xl",
            theme === 'lame' && "bg-[#F0F4F8] rounded-lg"
          )}>
            <div className="flex items-center gap-2 text-sm opacity-60 mb-1">
              <Calendar className="w-4 h-4" />
              Posted On
            </div>
            <div className="font-bold">{job.postedAt}</div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="prose max-w-none">
            <h2 className={cn(
              "text-2xl mb-4",
              theme === 'neo' && "font-display-neo uppercase font-black",
              theme === 'cottagecore' && "font-display-cottage font-bold",
              theme === 'lame' && "font-display-lame font-bold"
            )}>
              Role Description
            </h2>
            <div className={cn(
              "whitespace-pre-wrap leading-relaxed",
              theme === 'neo' && "font-mono text-lg",
              theme === 'cottagecore' && "font-serif text-[#2d4a22]",
              theme === 'lame' && "font-display-lame text-[#486581]"
            )}>
              {job.description}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {job.tags.map(tag => (
              <span 
                key={tag}
                className={cn(
                  "px-3 py-1 text-xs font-bold flex items-center gap-1",
                  theme === 'neo' && "bg-black text-white uppercase",
                  theme === 'cottagecore' && "bg-[#8a9a5b] text-white rounded-full",
                  theme === 'lame' && "bg-[#D9E2EC] text-[#102A43] rounded-md"
                )}
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
            <button className={cn(
              "flex-1 py-4 text-xl font-bold flex items-center justify-center gap-2 transition-all",
              theme === 'neo' && "bg-black text-white border-4 border-black hover:bg-white hover:text-black",
              theme === 'cottagecore' && "bg-[#8a9a5b] text-white rounded-2xl hover:bg-[#7a8a4b]",
              theme === 'lame' && "bg-[#00FFFF] text-[#102A43] rounded-lg hover:opacity-90"
            )}>
              Apply for this Role
              <ExternalLink className="w-5 h-5" />
            </button>
            <button className={cn(
              "px-8 py-4 text-xl font-bold transition-all",
              theme === 'neo' && "bg-white text-black border-4 border-black hover:bg-gray-100",
              theme === 'cottagecore' && "bg-white text-[#8a9a5b] border border-[#d2c5b3] rounded-2xl hover:bg-[#fdfbf7]",
              theme === 'lame' && "bg-white text-[#102A43] border border-[#D9E2EC] rounded-lg hover:bg-gray-50"
            )}>
              Contact Studio
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
