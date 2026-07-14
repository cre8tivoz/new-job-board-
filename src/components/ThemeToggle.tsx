import React from 'react';
import { Theme } from '../types';
import { cn } from '../lib/utils';
import { Sun, Moon, Briefcase } from 'lucide-react';

interface ThemeToggleProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const toggleTheme = () => {
    if (theme === 'neo') onChange('cottagecore');
    else if (theme === 'cottagecore') onChange('lame');
    else onChange('neo');
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center gap-2 px-4 py-2 transition-all duration-300",
        theme === 'neo' && "bg-black text-white border-4 border-black hover:bg-[#ccff00] hover:text-black font-display-neo uppercase font-bold tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        theme === 'cottagecore' && "bg-[#f4ecd8] text-[#5A5A40] border border-[#d2c5b3] rounded-full hover:bg-[#e8dec8] font-serif italic shadow-sm",
        theme === 'lame' && "bg-[#003366] text-white border border-[#002244] rounded-md hover:bg-[#004488] font-display-lame font-semibold tracking-tight shadow-lg"
      )}
    >
      {theme === 'neo' && (
        <>
          <Sun className="w-5 h-5" />
          <span className="hidden sm:inline">Neo Mode</span>
        </>
      )}
      {theme === 'cottagecore' && (
        <>
          <Moon className="w-5 h-5" />
          <span className="hidden sm:inline">Cottage Mode</span>
        </>
      )}
      {theme === 'lame' && (
        <>
          <Briefcase className="w-5 h-5 text-[#00FFFF]" />
          <span className="hidden sm:inline">Lame Mode</span>
        </>
      )}
    </button>
  );
}
