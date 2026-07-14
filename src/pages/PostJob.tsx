import React, { useState } from 'react';
import { Theme } from '../types';
import { cn } from '../lib/utils';
import { CreditCard, Sparkles, AlertCircle } from 'lucide-react';

interface PostJobProps {
  theme: Theme;
}

export function PostJob({ theme }: PostJobProps) {
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const MIN_CHARS = 50;

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
    
    if (value.trim().length === 0) {
      setError('Job description cannot be empty.');
    } else if (value.trim().length < MIN_CHARS) {
      setError(`Description must be at least ${MIN_CHARS} characters. Current: ${value.trim().length}`);
    } else {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < MIN_CHARS) {
      setError(`Please provide a more detailed description (at least ${MIN_CHARS} characters).`);
      return;
    }
    // Proceed with submission logic
    console.log('Form submitted');
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 flex flex-col lg:flex-row gap-12">
      <div className="flex-1 space-y-8">
        <div>
          <h1 className={cn(
            "text-4xl md:text-6xl mb-4",
            theme === 'neo' && "font-display-neo uppercase",
            theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]",
            theme === 'lame' && "font-display-lame font-black tracking-tight text-[#102A43]"
          )}>
            {theme === 'lame' ? "Submit Vacancy" : "Post an Exclusive Role"}
          </h1>
          <p className={cn("text-xl", theme === 'neo' && "font-mono", theme === 'cottagecore' && "font-serif text-[#c86b5e]", theme === 'lame' && "font-display-lame text-[#486581]")}>
            {theme === 'lame' 
              ? "Access Australia's premier creative talent pool for a standardized $30 administrative fee."
              : "Reach Australia's best creative talent for a flat $30 fee."}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className={cn("block font-bold", theme === 'neo' && "font-display-neo uppercase text-xl", theme === 'cottagecore' && "font-serif text-[#2d4a22]", theme === 'lame' && "font-display-lame text-[#102A43]")}>Job Title</label>
            <input type="text" placeholder="e.g. Senior Brand Designer" className={cn(
              "w-full p-4 outline-none",
              theme === 'neo' && "border-4 border-black font-mono",
              theme === 'cottagecore' && "rounded-xl border border-[#d2c5b3] bg-white",
              theme === 'lame' && "rounded-md border border-[#BCCCDC] bg-[#F0F4F8] font-display-lame focus:bg-white"
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={cn("block font-bold", theme === 'neo' && "font-display-neo uppercase text-xl", theme === 'cottagecore' && "font-serif text-[#2d4a22]", theme === 'lame' && "font-display-lame text-[#102A43]")}>Location</label>
              <input type="text" placeholder="e.g. Melbourne, VIC" className={cn(
                "w-full p-4 outline-none",
                theme === 'neo' && "border-4 border-black font-mono",
                theme === 'cottagecore' && "rounded-xl border border-[#d2c5b3] bg-white",
                theme === 'lame' && "rounded-md border border-[#BCCCDC] bg-[#F0F4F8] font-display-lame focus:bg-white"
              )} />
            </div>
            <div className="space-y-2">
              <label className={cn("block font-bold", theme === 'neo' && "font-display-neo uppercase text-xl", theme === 'cottagecore' && "font-serif text-[#2d4a22]", theme === 'lame' && "font-display-lame text-[#102A43]")}>Work Mode</label>
              <select className={cn(
                "w-full p-4 outline-none appearance-none cursor-pointer",
                theme === 'neo' && "border-4 border-black font-mono bg-white",
                theme === 'cottagecore' && "rounded-xl border border-[#d2c5b3] bg-white",
                theme === 'lame' && "rounded-md border border-[#BCCCDC] bg-[#F0F4F8] font-display-lame hover:bg-white focus:bg-white"
              )}>
                <option>Hybrid</option>
                <option>Remote</option>
                <option>On-site</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className={cn("block font-bold", theme === 'neo' && "font-display-neo uppercase text-xl", theme === 'cottagecore' && "font-serif text-[#2d4a22]", theme === 'lame' && "font-display-lame text-[#102A43]")}>
              Salary Range <span className="text-red-500">*</span>
            </label>
            <input type="text" placeholder="e.g. $110k - $130k + Super" className={cn(
              "w-full p-4 outline-none",
              theme === 'neo' && "border-4 border-black font-mono",
              theme === 'cottagecore' && "rounded-xl border border-[#d2c5b3] bg-white",
              theme === 'lame' && "rounded-md border border-[#BCCCDC] bg-[#F0F4F8] font-display-lame focus:bg-white"
            )} />
            <p className={cn("text-sm mt-1", theme === 'neo' && "font-mono text-gray-500", theme === 'cottagecore' && "italic text-[#8a9a5b]", theme === 'lame' && "font-display-lame text-[#627D98] italic")}>
              Mandatory. We believe in pay transparency.
            </p>
          </div>

          <div className="space-y-2">
            <label className={cn("block font-bold", theme === 'neo' && "font-display-neo uppercase text-xl", theme === 'cottagecore' && "font-serif text-[#2d4a22]", theme === 'lame' && "font-display-lame text-[#102A43]")}>Job Description</label>
            <textarea 
              rows={6} 
              placeholder="Describe the role..." 
              value={description}
              onChange={handleDescriptionChange}
              className={cn(
                "w-full p-4 outline-none resize-none transition-all",
                theme === 'neo' && "border-4 border-black font-mono",
                theme === 'cottagecore' && "rounded-xl border border-[#d2c5b3] bg-white",
                theme === 'lame' && "rounded-md border border-[#BCCCDC] bg-[#F0F4F8] font-display-lame focus:bg-white",
                error && (theme === 'neo' ? "border-red-500 bg-red-50" : "border-red-300 ring-1 ring-red-300")
              )} 
            />
            {error && (
              <div className={cn(
                "flex items-center gap-2 text-sm mt-1",
                theme === 'neo' && "font-mono text-red-600 font-bold",
                theme === 'cottagecore' && "font-serif text-red-500 italic",
                theme === 'lame' && "font-display-lame text-red-500"
              )}>
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className={cn(
              "text-right text-xs mt-1",
              theme === 'neo' && "font-mono",
              theme === 'cottagecore' && "font-serif italic",
              theme === 'lame' && "font-display-lame"
            )}>
              <span className={cn(description.length < MIN_CHARS ? "text-red-500" : "text-green-600")}>
                {description.length}
              </span>
              <span className="text-gray-400"> / {MIN_CHARS} min characters</span>
            </div>
          </div>

          <div className={cn(
            "p-6 mt-8",
            theme === 'neo' && "bg-gray-100 border-4 border-black",
            theme === 'cottagecore' && "bg-[#f4ecd8] rounded-2xl border border-[#d2c5b3]",
            theme === 'lame' && "bg-white rounded-lg border border-[#D9E2EC] shadow-sm"
          )}>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className={cn("w-6 h-6", theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#102A43]" : "text-[#2d4a22]")} />
              <h3 className={cn("text-2xl", theme === 'neo' && "font-display-neo uppercase", theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]", theme === 'lame' && "font-display-lame font-bold text-[#102A43]")}>
                {theme === 'lame' ? "Billing Information" : "Payment Details"}
              </h3>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Card Number" className={cn(
                "w-full p-4 outline-none",
                theme === 'neo' && "border-4 border-black font-mono bg-white",
                theme === 'cottagecore' && "rounded-xl border border-[#d2c5b3] bg-white",
                theme === 'lame' && "rounded-md border border-[#BCCCDC] bg-[#F0F4F8] font-display-lame focus:bg-white"
              )} />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="MM/YY" className={cn(
                  "w-full p-4 outline-none",
                  theme === 'neo' && "border-4 border-black font-mono bg-white",
                  theme === 'cottagecore' && "rounded-xl border border-[#d2c5b3] bg-white",
                  theme === 'lame' && "rounded-md border border-[#BCCCDC] bg-[#F0F4F8] font-display-lame focus:bg-white"
                )} />
                <input type="text" placeholder="CVC" className={cn(
                  "w-full p-4 outline-none",
                  theme === 'neo' && "border-4 border-black font-mono bg-white",
                  theme === 'cottagecore' && "rounded-xl border border-[#d2c5b3] bg-white",
                  theme === 'lame' && "rounded-md border border-[#BCCCDC] bg-[#F0F4F8] font-display-lame focus:bg-white"
                )} />
              </div>
            </div>
          </div>

          <button className={cn(
            "w-full py-6 text-2xl transition-all flex items-center justify-center gap-2",
            theme === 'neo' && "bg-[#ff00ff] text-white font-display-neo font-bold uppercase border-4 border-black hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
            theme === 'cottagecore' && "bg-[#2d4a22] text-[#fdfbf7] font-serif rounded-full hover:bg-[#1a2e13] shadow-md",
            theme === 'lame' && "bg-[#102A43] text-white font-display-lame font-bold rounded-md hover:bg-[#243B53] shadow-sm"
          )}>
            {theme === 'lame' ? "Process Payment & Submit" : "Pay $30 & Submit Role"}
          </button>
        </form>
      </div>

      <div className="lg:w-80 flex-shrink-0">
        <div className={cn(
          "sticky top-28 p-6",
          theme === 'neo' && "bg-[#ccff00] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
          theme === 'cottagecore' && "bg-[#fdfbf7] rounded-2xl border border-[#d2c5b3]",
          theme === 'lame' && "bg-[#243B53] rounded-lg text-white"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className={cn("w-6 h-6", theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#00FFFF]" : "text-[#8a9a5b]")} />
            <h3 className={cn("text-2xl", theme === 'neo' && "font-display-neo uppercase", theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]", theme === 'lame' && "font-display-lame font-bold")}>
              {theme === 'lame' ? "Submission Guidelines" : "Writing Tips"}
            </h3>
          </div>
          <ul className={cn("space-y-4", theme === 'neo' && "font-mono text-sm", theme === 'cottagecore' && "font-serif text-[#c86b5e]", theme === 'lame' && "font-display-lame text-[#BCCCDC] text-sm")}>
            <li>• Write the job you'd want to apply for.</li>
            <li>• Be clear about expectations and day-to-day tasks.</li>
            <li>• Avoid corporate jargon ("rockstar", "ninja").</li>
            <li>• Highlight your studio's culture and values.</li>
          </ul>
        </div>
      </div>
    </div>
  );
 }
