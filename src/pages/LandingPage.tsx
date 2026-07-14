import React from 'react';
import { Theme } from '../types';
import { cn } from '../lib/utils';
import { ArrowRight, Star, Shield, Zap, Users } from 'lucide-react';

interface LandingPageProps {
  theme: Theme;
  onNavigate: (tab: string) => void;
}

export function LandingPage({ theme, onNavigate }: LandingPageProps) {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className={cn(
        "relative overflow-hidden p-3 sm:p-8 md:p-16",
        theme === 'neo' && "bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-3xl",
        theme === 'cottagecore' && "bg-[#f4ecd8] border border-[#d2c5b3] rounded-3xl",
        theme === 'lame' && "bg-[#F0F4F8] border border-[#D9E2EC] shadow-sm rounded-lg"
      )}>
        {theme === 'cottagecore' && (
          <>
            <div className="absolute -top-4 -left-4 text-8xl opacity-10 -rotate-12 pointer-events-none select-none">🌿</div>
            <div className="absolute -bottom-4 -right-4 text-8xl opacity-10 rotate-12 scale-x-[-1] pointer-events-none select-none">🌿</div>
          </>
        )}
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <h1 className={cn(
            "text-2xl sm:text-6xl md:text-8xl",
            theme === 'neo' && "font-display-neo uppercase tracking-wide leading-none",
            theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22] leading-tight",
            theme === 'lame' && "font-display-lame font-black tracking-tight text-[#102A43] leading-none"
          )}>
            {theme === 'lame' ? "Professional Creative Recruitment." : (
              <>The <em className={cn(theme === 'cottagecore' && "italic", theme === 'neo' && "not-italic text-[#ff00ff]")}>Anti-Beige</em> Job Board.</>
            )}
          </h1>
          <p className={cn(
            "text-xl md:text-2xl max-w-2xl mx-auto",
            theme === 'neo' && "font-mono",
            theme === 'cottagecore' && "font-serif italic text-[#c86b5e]",
            theme === 'lame' && "font-display-lame text-[#486581] font-medium"
          )}>
            {theme === 'lame' 
              ? "A streamlined interface for identifying high-value career opportunities within the Australian creative landscape. Verified listings only."
              : "For Australian creatives who are tired of the corporate noise. Verified roles. Direct access. Zero bidding wars."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button 
              onClick={() => onNavigate('jobs')}
              className={cn(
                "w-full sm:w-auto px-8 py-4 text-lg transition-all flex items-center justify-center gap-2",
                theme === 'neo' && "bg-[#ff00ff] text-white font-display-neo font-bold uppercase border-4 border-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
                theme === 'cottagecore' && "bg-[#2d4a22] text-[#fdfbf7] font-serif rounded-full hover:bg-[#1a2e13] shadow-md",
                theme === 'lame' && "bg-[#102A43] text-white font-display-lame font-bold rounded-md hover:bg-[#243B53] shadow-sm"
              )}
            >
              Join as Creative <ArrowRight className={cn("w-5 h-5", theme === 'lame' && "text-[#00FFFF]")} />
            </button>
            <button 
              onClick={() => onNavigate('post')}
              className={cn(
                "w-full sm:w-auto px-8 py-4 text-lg transition-all",
                theme === 'neo' && "bg-white text-black font-display-neo font-bold uppercase border-4 border-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
                theme === 'cottagecore' && "bg-transparent text-[#2d4a22] border border-[#2d4a22] font-serif rounded-full hover:bg-[#fdfbf7]",
                theme === 'lame' && "bg-white text-[#102A43] border border-[#BCCCDC] font-display-lame font-bold rounded-md hover:bg-[#F0F4F8]"
              )}
            >
              Post a Role
            </button>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="max-w-5xl mx-auto">
        <h2 className={cn(
          "text-4xl md:text-6xl text-center mb-16",
          theme === 'neo' && "font-display-neo uppercase",
          theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]",
          theme === 'lame' && "font-display-lame font-black tracking-tight text-[#102A43]"
        )}>
          {theme === 'lame' ? "Core Value Propositions" : "Our Manifesto"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: Shield, title: "Flat-Rate Pricing", desc: "$30 in 2026. $50 in 2027. Same for everyone. No bidding to the top." },
            { icon: Star, title: "Free Talent Passports", desc: "Beautiful, shareable profile pages for candidates. Always free." },
            { icon: Zap, title: "Cre8tiv Exclusives", desc: "Direct, spam-free listings from studios you actually want to work for." },
            { icon: Users, title: "Radical Transparency", desc: "Public metrics. Honest revenue breakdown. We hide nothing." }
          ].map((item, i) => (
            <div key={i} className={cn(
              "p-8",
              theme === 'neo' && "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
              theme === 'cottagecore' && "bg-white rounded-2xl border border-[#d2c5b3] shadow-sm",
              theme === 'lame' && "bg-white rounded-lg border border-[#D9E2EC] shadow-sm"
            )}>
              <item.icon className={cn("w-12 h-12 mb-6", theme === 'neo' ? "text-[#ff00ff]" : theme === 'lame' ? "text-[#00FFFF]" : "text-[#8a9a5b]")} />
              <h3 className={cn("text-2xl mb-4", theme === 'neo' && "font-display-neo uppercase", theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]", theme === 'lame' && "font-display-lame font-bold text-[#102A43]")}>
                {item.title}
              </h3>
              <p className={cn("text-lg", theme === 'neo' && "font-mono text-sm", theme === 'cottagecore' && "text-gray-600", theme === 'lame' && "font-display-lame text-[#486581] text-sm")}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Email Capture */}
      <section className={cn(
        "max-w-3xl mx-auto p-8 md:p-12 text-center",
        theme === 'neo' && "bg-[#ccff00] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
        theme === 'cottagecore' && "bg-[#e8dec8] rounded-3xl",
        theme === 'lame' && "bg-[#243B53] rounded-lg text-white"
      )}>
        <h2 className={cn("text-3xl md:text-5xl mb-6", theme === 'neo' && "font-display-neo uppercase", theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]", theme === 'lame' && "font-display-lame font-black tracking-tight")}>
          {theme === 'lame' ? "Subscribe to Updates" : "Stay in the Loop"}
        </h2>
        <p className={cn("mb-8 text-lg", theme === 'neo' && "font-mono", theme === 'cottagecore' && "font-serif text-[#5A5A40]", theme === 'lame' && "font-display-lame text-[#BCCCDC]")}>
          {theme === 'lame' 
            ? "Receive high-frequency notifications regarding the most relevant creative opportunities in your sector."
            : "Get the best creative roles delivered to your inbox weekly. No spam, just signal."}
        </p>
        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="your@email.com" 
            className={cn(
              "flex-1 px-6 py-4 outline-none",
              theme === 'neo' && "border-4 border-black font-mono",
              theme === 'cottagecore' && "rounded-full border border-[#d2c5b3] bg-white",
              theme === 'lame' && "rounded-md border border-[#486581] bg-[#102A43] text-white font-display-lame"
            )}
          />
          <button className={cn(
            "px-8 py-4 transition-all",
            theme === 'neo' && "bg-black text-white font-display-neo uppercase text-xl border-4 border-black hover:bg-white hover:text-black",
            theme === 'cottagecore' && "bg-[#2d4a22] text-white rounded-full font-serif",
            theme === 'lame' && "bg-[#00FFFF] text-[#102A43] rounded-md font-display-lame font-bold hover:bg-[#33FFFF]"
          )}>
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}
