import React from 'react';
import { Theme } from '../types';
import { cn } from '../lib/utils';
import { CheckCircle2, Heart } from 'lucide-react';
import { Roadmap } from '../components/Roadmap';

interface TransparencyProps {
  theme: Theme;
}

export function Transparency({ theme }: TransparencyProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-24 pb-24">
      <div className="space-y-16 max-w-4xl mx-auto px-4 sm:px-0">
        <div className="text-center space-y-6">
          <h1 className={cn(
            "text-4xl sm:text-5xl md:text-7xl",
            theme === 'neo' && "font-display-neo uppercase",
            theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]",
            theme === 'lame' && "font-display-lame font-black tracking-tight text-[#102A43]"
          )}>
            {theme === 'lame' ? "Operational Transparency" : "Radical Transparency"}
          </h1>
          <p className={cn("text-xl max-w-2xl mx-auto", theme === 'neo' && "font-mono", theme === 'cottagecore' && "font-serif text-[#c86b5e]", theme === 'lame' && "font-display-lame text-[#486581]")}>
            {theme === 'lame' 
              ? "A comprehensive overview of platform performance metrics and fiscal allocation strategies."
              : "We believe in open books. Here's exactly how the platform is performing and where the money goes."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={cn(
            "p-8",
            theme === 'neo' && "bg-[#ccff00] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
            theme === 'cottagecore' && "bg-[#fdfbf7] rounded-3xl border border-[#d2c5b3]",
            theme === 'lame' && "bg-[#243B53] rounded-lg text-white"
          )}>
            <h2 className={cn("text-3xl mb-8", theme === 'neo' && "font-display-neo uppercase", theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]", theme === 'lame' && "font-display-lame font-black tracking-tight")}>
              {theme === 'lame' ? "Key Performance Indicators" : "Platform Metrics"}
            </h2>
            <div className="space-y-6">
              {[
                { label: "Total Jobs Listed", value: "1,248" },
                { label: "Cre8tiv Exclusives", value: "892" },
                { label: "Studios Signed Up", value: "345" },
                { label: "Offers Made (Anonymised)", value: "412" },
                { label: "Average Time to Fill", value: "14 Days" },
              ].map((m, i) => (
                <div key={i} className={cn("flex justify-between items-end border-b pb-2", theme === 'lame' ? "border-[#486581]" : "border-black/10")}>
                  <span className={cn("text-lg", theme === 'neo' && "font-sans font-medium", theme === 'lame' && "font-display-lame text-[#BCCCDC]", theme === 'cottagecore' && "text-gray-700")}>{m.label}</span>
                  <span className={cn("text-2xl", theme === 'neo' && "font-display-neo", theme === 'cottagecore' && "font-display-cottage font-bold text-[#8a9a5b]", theme === 'lame' && "font-display-lame font-black text-[#00FFFF]")}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(
            "p-8",
            theme === 'neo' && "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
            theme === 'cottagecore' && "bg-[#f4ecd8] rounded-3xl border border-[#d2c5b3]",
            theme === 'lame' && "bg-white rounded-lg border border-[#D9E2EC] shadow-sm"
          )}>
            <h2 className={cn("text-3xl mb-8", theme === 'neo' && "font-display-neo uppercase", theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]", theme === 'lame' && "font-display-lame font-bold text-[#102A43]")}>
              {theme === 'lame' ? "Fiscal Allocation" : "Where the $30 goes"}
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className={cn("flex justify-between text-sm font-bold", theme === 'lame' && "font-display-lame text-[#102A43]")}>
                  <span>Platform Hosting & Dev</span>
                  <span>$13.80 (46%)</span>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className={cn("h-full w-[46%]", theme === 'lame' ? "bg-[#102A43]" : "bg-black")}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className={cn("flex justify-between text-sm font-bold", theme === 'lame' && "font-display-lame text-[#102A43]")}>
                  <span>Marketing & Outreach</span>
                  <span>$6.20 (20.7%)</span>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className={cn("h-full w-[20.7%]", theme === 'lame' ? "bg-[#00FFFF]" : "bg-[#ff00ff]")}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className={cn("flex justify-between text-sm font-bold", theme === 'lame' && "font-display-lame text-[#102A43]")}>
                  <span>Coffee & Carlos' Treats</span>
                  <span>$10.00 (33.3%)</span>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className={cn("h-full w-[33.3%]", theme === 'lame' ? "bg-[#243B53]" : "bg-[#ccff00]")}></div>
                </div>
              </div>
            </div>
            <div className={cn("mt-8 pt-8 border-t flex items-start gap-4", theme === 'lame' ? "border-[#D9E2EC]" : "border-black/10")}>
              <Heart className={cn("w-8 h-8 flex-shrink-0", theme === 'neo' ? "text-[#ff00ff]" : theme === 'lame' ? "text-[#00FFFF]" : "text-[#c86b5e]")} />
              <p className={cn("text-sm", theme === 'neo' && "font-mono", theme === 'cottagecore' && "italic", theme === 'lame' && "font-display-lame text-[#486581]")}>
                We keep prices flat so boutique studios have the same reach as massive agencies. No bidding wars. No premium placements.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-12 border-t border-black/10">
        <Roadmap theme={theme} />
      </div>
    </div>
  );
}
