import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Theme } from '../types';
import { cn } from '../lib/utils';
import { Home, Briefcase, LayoutDashboard, Building2, BriefcaseBusiness, Kanban } from 'lucide-react';

interface MobileBottomNavProps {
  theme: Theme;
  applicationCount: number;
}

export function MobileBottomNav({ theme, applicationCount }: MobileBottomNavProps) {
  const location = useLocation();
  const activeTab = location.pathname.split('/')[1] || 'home';

  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      path: '/', 
      icon: theme === 'lame' ? Building2 : Home 
    },
    { 
      id: 'jobs', 
      label: 'Jobs', 
      path: '/jobs', 
      icon: theme === 'lame' ? BriefcaseBusiness : Briefcase 
    },
    { 
      id: 'board', 
      label: 'Board', 
      path: '/board', 
      icon: theme === 'lame' ? Kanban : LayoutDashboard 
    },
  ];

  return (
    <nav className={cn(
      "lg:hidden fixed bottom-0 left-0 right-0 z-50 px-6 py-3 flex items-center justify-around border-t backdrop-blur-lg transition-all duration-300",
      theme === 'neo' && "bg-white border-black border-t-4 pb-6",
      theme === 'cottagecore' && "bg-[#fdfbf7]/90 border-[#d2c5b3] rounded-t-3xl shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-6",
      theme === 'lame' && "bg-[#0B1D33]/95 border-[#334E68] text-white pb-6"
    )}>
      {navItems.map((item) => {
        const isActive = activeTab === item.id || (item.id === 'home' && activeTab === '');
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-all relative",
              theme === 'neo' && (isActive ? "text-black scale-110" : "text-gray-400"),
              theme === 'cottagecore' && (isActive ? "text-[#2d4a22] scale-110" : "text-[#8a9a5b]"),
              theme === 'lame' && (isActive ? "text-[#00FFFF] scale-110" : "text-gray-400")
            )}
          >
            <div className={cn(
              "p-1 rounded-lg transition-colors",
              theme === 'neo' && isActive && "bg-[#FFFF00] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
              theme === 'cottagecore' && isActive && "bg-[#f4ecd8]",
              theme === 'lame' && isActive && "bg-[#1a3a5a]"
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              theme === 'neo' && "font-display-neo",
              theme === 'cottagecore' && "font-serif italic",
              theme === 'lame' && "font-display-lame"
            )}>
              {item.label}
            </span>
            
            {item.id === 'board' && applicationCount > 0 && (
              <span className={cn(
                "absolute -top-1 -right-1 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center font-bold px-1",
                theme === 'neo' && "bg-[#ff00ff] text-white border-2 border-black",
                theme === 'cottagecore' && "bg-[#c86b5e] text-white rounded-full",
                theme === 'lame' && "bg-[#00FFFF] text-[#102A43] rounded-sm"
              )}>
                {applicationCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
