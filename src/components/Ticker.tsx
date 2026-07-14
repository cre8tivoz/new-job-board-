import React from 'react';
import { Theme } from '../types';
import { cn } from '../lib/utils';

interface TickerProps {
  theme: Theme;
}

export function Ticker({ theme }: TickerProps) {
  const items = [
    "NO RECRUITERS",
    "DIRECT TO STUDIO",
    "VERIFIED SALARIES",
    "NO BIDDING WARS",
    "CREATIVE ROLES ONLY",
    "AUSTRALIA WIDE",
    "NO BULLSHIT",
    "TRANSPARENT PRICING"
  ];

  // Duplicate items to ensure smooth infinite scroll
  const displayItems = [...items, ...items, ...items];

  return (
    <div className={cn(
      "w-full overflow-hidden border-b whitespace-nowrap py-2",
      theme === 'neo' && "bg-black border-black border-b-4",
      theme === 'cottagecore' && "bg-[#8a9a5b] border-[#d2c5b3]",
      theme === 'lame' && "bg-[#0B1D33] border-[#334E68]"
    )}>
      <div className="inline-block animate-ticker">
        {displayItems.map((item, i) => (
          <React.Fragment key={i}>
            <span className={cn(
              "inline-block",
              theme === 'neo' && "font-display-neo text-[#00FFFF] text-lg tracking-[0.2em] uppercase",
              theme === 'cottagecore' && "font-serif text-[#fdfbf7] text-sm tracking-widest italic",
              theme === 'lame' && "font-display-lame text-[#BCCCDC] text-xs font-bold tracking-widest uppercase"
            )}>
              {item}
            </span>
            <span className={cn(
              "inline-block mx-6",
              theme === 'neo' && "text-[#FF00FF]",
              theme === 'cottagecore' && "text-[#f4ecd8]",
              theme === 'lame' && "text-[#00FFFF]"
            )}>
              {theme === 'neo' ? '✦' : theme === 'cottagecore' ? '🌿' : '•'}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
