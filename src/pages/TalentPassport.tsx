import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Theme } from '../types';
import { cn } from '../lib/utils';
import { ExternalLink, MapPin, Briefcase, Shield, FileText, LogIn, Loader2 } from 'lucide-react';
import { usePassport } from '../PassportContext';
import { loginWithGoogle } from '../firebase';

interface TalentPassportProps {
  theme: Theme;
}

export function TalentPassport({ theme }: TalentPassportProps) {
  const { passportData, user, isAuthReady } = usePassport();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-6">
        <div className={cn(
          "p-12 space-y-8",
          theme === 'neo' && "bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]",
          theme === 'cottagecore' && "bg-[#fdfbf7] rounded-[3rem] border-2 border-[#d2c5b3] shadow-sm",
          theme === 'lame' && "bg-white rounded-xl border border-[#D9E2EC] shadow-lg"
        )}>
          <div className={cn(
            "w-20 h-20 mx-auto flex items-center justify-center",
            theme === 'neo' && "bg-[#ccff00] border-4 border-black",
            theme === 'cottagecore' && "bg-[#f4ecd8] rounded-full",
            theme === 'lame' && "bg-[#F0F4F8] rounded-full"
          )}>
            <LogIn className={cn("w-10 h-10", theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#102A43]" : "text-[#2d4a22]")} />
          </div>
          <div className="space-y-4">
            <h2 className={cn(
              "text-3xl md:text-4xl",
              theme === 'neo' && "font-display-neo uppercase",
              theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]",
              theme === 'lame' && "font-display-lame font-black tracking-tight text-[#102A43]"
            )}>
              View Your Passport
            </h2>
            <p className={cn(
              "text-lg opacity-70",
              theme === 'neo' && "font-mono",
              theme === 'cottagecore' && "font-serif",
              theme === 'lame' && "font-display-lame"
            )}>
              Log in to view and manage your Talent Passport. Your passport is your gateway to the creative industry.
            </p>
          </div>
          <button
            onClick={() => navigate('/login', { state: { from: location } })}
            className={cn(
              "w-full py-4 text-xl transition-all flex items-center justify-center gap-3",
              theme === 'neo' && "bg-black text-white font-display-neo uppercase border-4 border-black hover:bg-[#ccff00] hover:text-black",
              theme === 'cottagecore' && "bg-[#2d4a22] text-white rounded-full font-serif hover:bg-[#1a2e13]",
              theme === 'lame' && "bg-[#102A43] text-white rounded-md font-display-lame hover:bg-[#243B53]"
            )}
          >
            <LogIn className="w-6 h-6" />
            Sign in to View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      <div className={cn(
        "p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start",
        theme === 'neo' && "bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
        theme === 'cottagecore' && "bg-[#fdfbf7] rounded-3xl border border-[#d2c5b3]",
        theme === 'lame' && "bg-white rounded-lg border border-[#D9E2EC] shadow-sm"
      )}>
        <img 
          src={passportData.avatarUrl} 
          alt={passportData.name} 
          className={cn(
            "w-32 h-32 md:w-48 md:h-48 object-cover",
            theme === 'neo' && "border-4 border-black",
            theme === 'cottagecore' && "rounded-full border-4 border-[#d2c5b3] shadow-[0_4px_12px_rgba(138,154,91,0.2)]",
            theme === 'lame' && "rounded-lg grayscale hover:grayscale-0 transition-all"
          )}
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className={cn(
              "text-4xl md:text-6xl",
              theme === 'neo' && "font-display-neo uppercase",
              theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]",
              theme === 'lame' && "font-display-lame font-black tracking-tight text-[#102A43]"
            )}>
              {passportData.name}
            </h1>
            <span className={cn(
              "px-4 py-2 text-sm font-bold flex items-center gap-2",
              theme === 'neo' && "bg-[#ccff00] border-2 border-black uppercase",
              theme === 'cottagecore' && "bg-[#f4ecd8] text-[#8a9a5b] rounded-full italic font-serif",
              theme === 'lame' && "bg-[#F0F4F8] text-[#102A43] rounded-md font-display-lame border border-[#D9E2EC]"
            )}>
              <Shield className="w-4 h-4" /> {theme === 'lame' ? "Verified Professional" : "Cre8tiv Passport"}
            </span>
          </div>
          <p className={cn("text-2xl", theme === 'neo' && "font-mono", theme === 'cottagecore' && "font-serif text-[#c86b5e]", theme === 'lame' && "font-display-lame font-bold text-[#486581]")}>
            {passportData.title}
          </p>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <span className={cn("flex items-center gap-1", theme === 'lame' && "font-display-lame")}><MapPin className="w-4 h-4" /> {passportData.location}</span>
            <span className={cn("flex items-center gap-1", theme === 'lame' && "font-display-lame")}><Briefcase className="w-4 h-4" /> {passportData.experience}</span>
          </div>
          <p className={cn("max-w-2xl pt-4", theme === 'neo' && "font-sans", theme === 'cottagecore' && "text-gray-700", theme === 'lame' && "font-display-lame text-[#486581]")}>
            {passportData.bio}
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <a href="#" className={cn(
              "inline-flex items-center gap-2 px-6 py-3 transition-all",
              theme === 'neo' && "bg-black text-white font-display-neo uppercase border-2 border-black hover:bg-white hover:text-black",
              theme === 'cottagecore' && "bg-[#2d4a22] text-white rounded-full font-serif hover:bg-[#1a2e13]",
              theme === 'lame' && "bg-[#102A43] text-white rounded-md font-display-lame hover:bg-[#243B53]"
            )}>
              {theme === 'lame' ? "View Professional Portfolio" : "View Full Portfolio"} <ExternalLink className="w-4 h-4" />
            </a>

            {passportData.resume && (
              <a 
                href={passportData.resume.url} 
                download={passportData.resume.name}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 transition-all",
                  theme === 'neo' && "bg-[#ccff00] text-black font-display-neo uppercase border-2 border-black hover:bg-black hover:text-[#ccff00]",
                  theme === 'cottagecore' && "bg-[#f4ecd8] text-[#2d4a22] rounded-full font-serif border border-[#d2c5b3] hover:bg-[#e8dfc8]",
                  theme === 'lame' && "bg-[#00FFFF] text-[#102A43] rounded-md font-display-lame font-bold hover:bg-[#00E5E5]"
                )}
              >
                Download Resume <FileText className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className={cn(
          "text-3xl mb-8",
          theme === 'neo' && "font-display-neo uppercase",
          theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]",
          theme === 'lame' && "font-display-lame font-black tracking-tight text-[#102A43]"
        )}>
          {theme === 'lame' ? "Project Portfolio" : "Selected Works"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {passportData.projects.map(p => (
            <div key={p.id} className={cn(
              "group relative overflow-hidden",
              theme === 'neo' && "border-4 border-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all",
              theme === 'cottagecore' && "rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow",
              theme === 'lame' && "rounded-lg overflow-hidden border border-[#D9E2EC] hover:border-[#00FFFF] transition-all"
            )}>
              <img src={p.img} alt={p.title} className="w-full aspect-[4/3] object-cover" referrerPolicy="no-referrer" />
              <div className={cn(
                "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                theme === 'neo' && "bg-[#ff00ff]/90",
                theme === 'cottagecore' && "bg-[#2d4a22]/80",
                theme === 'lame' && "bg-[#102A43]/90"
              )}>
                <span className={cn(
                  "text-2xl text-white",
                  theme === 'neo' && "font-display-neo uppercase",
                  theme === 'cottagecore' && "font-display-cottage font-bold",
                  theme === 'lame' && "font-display-lame font-black tracking-tight"
                )}>
                  {p.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
