import React from 'react';
import { Theme } from '../types';
import { cn } from '../lib/utils';
import { Heart, Coffee } from 'lucide-react';

interface FooterProps {
  theme: Theme;
}

export function Footer({ theme }: FooterProps) {
  const text = "Final build approved by Carlos the Chihuahua - Designed with Love & Caffeine by Jaques Creative";
  const link = "https://jaquescreative.com";

  return (
    <footer className={cn(
      "mt-auto py-12 px-4",
      theme === 'neo' && "bg-[#FFFF00] pb-24",
      theme === 'cottagecore' && "bg-transparent pb-16",
      theme === 'lame' && "bg-white border-t border-[#D9E2EC] pb-16"
    )}>
      <div className="max-w-7xl mx-auto flex justify-center">
        {theme === 'neo' && (
          <div className="bg-[#ff00ff] border-4 border-black border-dashed p-6 -rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl text-center">
            <p className="font-mono font-bold text-black text-lg md:text-xl uppercase leading-tight">
              Final build approved by Carlos the Chihuahua - Designed with <span className="inline-flex items-center gap-1">Love <Heart className="w-5 h-5 fill-black" /></span> & <span className="inline-flex items-center gap-1">Caffeine <Coffee className="w-5 h-5" /></span> by <a href={link} target="_blank" rel="noopener noreferrer" className="underline decoration-4 underline-offset-4 hover:bg-black hover:text-white transition-colors">Jaques Creative</a>
            </p>
          </div>
        )}

        {theme === 'cottagecore' && (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-[#8a9a5b] mb-2">
              <span className="text-2xl">🌿</span>
              <div className="h-px w-12 bg-[#d2c5b3]" />
              <span className="text-2xl">🌿</span>
            </div>
            <p className="font-serif italic text-[#5A5A40] text-lg">
              Final build approved by Carlos the Chihuahua
            </p>
            <p className="font-serif text-[#c86b5e] text-sm">
              Designed with Love & Caffeine by <a href={link} target="_blank" rel="noopener noreferrer" className="underline decoration-[#d2c5b3] underline-offset-4 hover:text-[#2d4a22] transition-colors">Jaques Creative</a>
            </p>
          </div>
        )}

        {theme === 'lame' && (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4 text-[#BCCCDC]">
              <div className="h-px w-24 bg-[#D9E2EC]" />
              <div className="w-2 h-2 bg-[#00FFFF] rotate-45" />
              <div className="h-px w-24 bg-[#D9E2EC]" />
            </div>
            <p className="font-display-lame text-[#102A43] font-bold uppercase tracking-[0.2em] text-xs">
              Final build approved by Carlos the Chihuahua
            </p>
            <p className="font-display-lame text-[#627D98] text-[10px] uppercase tracking-widest">
              Designed with Love & Caffeine by <a href={link} target="_blank" rel="noopener noreferrer" className="hover:text-[#00FFFF] transition-colors border-b border-[#D9E2EC]">Jaques Creative</a>
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}
