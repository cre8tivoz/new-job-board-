import React, { useState } from 'react';
import { Theme } from '../types';
import { cn } from '../lib/utils';
import { ThumbsUp, ThumbsDown, CheckCircle2, Hammer, Telescope, Lightbulb } from 'lucide-react';

type RoadmapStatus = 'live' | 'next' | 'horizon' | 'ideas';

interface RoadmapItem {
  id: string;
  status: RoadmapStatus;
  title: string;
  description: string;
  emoji: string;
  tags: string[];
  progress?: number;
  initialVotes: number;
}

const ROADMAP_ITEMS: RoadmapItem[] = [
  { id: '1', status: 'live', title: 'Basic Job Board', description: 'The core platform for posting and finding creative roles.', emoji: '📋', tags: ['Core'], initialVotes: 142 },
  { id: '2', status: 'live', title: 'Talent Passports', description: 'Shareable portfolios for creatives to showcase their work.', emoji: '🎨', tags: ['Core', 'Creatives'], initialVotes: 89 },
  { id: '3', status: 'live', title: 'Studio Dashboard', description: 'Analytics and applicant tracking for hiring studios.', emoji: '📊', tags: ['Core', 'Studios'], initialVotes: 112 },
  { id: '4', status: 'next', title: 'Live Job Data', description: 'Real-time updates for job views, applications, and status changes.', emoji: '⚡', tags: ['Data'], progress: 65, initialVotes: 256 },
  { id: '5', status: 'next', title: 'Connect Databases Up', description: 'Migrating from mock data to a live backend database.', emoji: '🗄️', tags: ['Infrastructure'], progress: 40, initialVotes: 184 },
  { id: '6', status: 'horizon', title: 'Stripe Integration', description: 'Process real payments for job postings instead of mock checkouts.', emoji: '💳', tags: ['Payments'], initialVotes: 312 },
  { id: '7', status: 'horizon', title: 'Automated Email Alerts', description: 'Get notified the moment a relevant job is posted.', emoji: '🔔', tags: ['Notifications'], initialVotes: 420 },
  { id: '8', status: 'ideas', title: 'Portfolio Reviews', description: 'Get your Talent Passport reviewed by senior industry professionals.', emoji: '👀', tags: ['Community'], initialVotes: 156 },
  { id: '9', status: 'ideas', title: 'Mentorship Matching', description: 'Connect junior creatives with established art directors and leads.', emoji: '🤝', tags: ['Community'], initialVotes: 289 },
];

const LANES: { id: RoadmapStatus; label: string; icon: any; desc: string; color: string }[] = [
  { id: 'live', label: 'Live', icon: CheckCircle2, desc: 'Shipped and working', color: 'text-green-500' },
  { id: 'next', label: 'Up Next', icon: Hammer, desc: 'Currently building', color: 'text-blue-500' },
  { id: 'horizon', label: 'On the Horizon', icon: Telescope, desc: 'Planned, not yet started', color: 'text-purple-500' },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb, desc: 'Exploring — vote to move them up', color: 'text-yellow-500' },
];

export function Roadmap({ theme }: { theme: Theme }) {
  const [activeFilter, setActiveFilter] = useState<RoadmapStatus | 'all'>('all');
  const [votes, setVotes] = useState<Record<string, 'up' | 'down'>>({});

  const handleVote = (id: string, dir: 'up' | 'down') => {
    setVotes(prev => {
      const current = prev[id];
      if (current === dir) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: dir };
    });
  };

  const getScore = (item: RoadmapItem) => {
    let score = item.initialVotes;
    if (votes[item.id] === 'up') score += 1;
    if (votes[item.id] === 'down') score -= 1;
    return score;
  };

  const filteredLanes = LANES.filter(lane => activeFilter === 'all' || activeFilter === lane.id);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className={cn(
          "text-4xl md:text-5xl",
          theme === 'neo' && "font-display-neo uppercase",
          theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]",
          theme === 'lame' && "font-display-lame font-black tracking-tight text-[#102A43]"
        )}>
          {theme === 'lame' ? "Product Roadmap" : "What We're Building"}
        </h2>
        <p className={cn("text-lg max-w-2xl mx-auto", theme === 'neo' && "font-mono", theme === 'cottagecore' && "font-serif text-[#c86b5e]", theme === 'lame' && "font-display-lame text-[#486581]")}>
          No smoke and mirrors. Here's exactly what's live, what's next, and what's on the horizon. If something matters to you — vote for it.
        </p>
      </div>

      {/* Voting Banner */}
      <div className={cn(
        "p-6 flex items-start sm:items-center gap-4",
        theme === 'neo' && "bg-[#ccff00] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
        theme === 'cottagecore' && "bg-[#fdfbf7] border-l-4 border-[#8a9a5b] rounded-r-xl shadow-sm",
        theme === 'lame' && "bg-white border-l-4 border-[#00FFFF] rounded shadow-sm"
      )}>
        <div className="text-3xl">🗳️</div>
        <div className="flex-1">
          <p className={cn(theme === 'neo' && "font-mono text-sm", theme === 'cottagecore' && "font-serif text-[#5A5A40]", theme === 'lame' && "font-display-lame text-[#102A43]")}>
            <span className="group relative inline-block cursor-help">
              <strong>Your vote actually counts.</strong>
              
              {/* Tooltip */}
              <span className={cn(
                "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center font-normal",
                theme === 'neo' && "bg-black text-white font-mono border-2 border-black",
                theme === 'cottagecore' && "bg-[#2d4a22] text-[#fdfbf7] font-serif rounded-lg shadow-lg",
                theme === 'lame' && "bg-[#102A43] text-white font-display-lame rounded shadow-md"
              )}>
                Votes are tallied bi-weekly. Items with the highest score are prioritized in our next sprint planning session.
                <span className={cn(
                  "absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45",
                  theme === 'neo' && "bg-black",
                  theme === 'cottagecore' && "bg-[#2d4a22]",
                  theme === 'lame' && "bg-[#102A43]"
                )} />
              </span>
            </span>
            {" "}We look at this every fortnight when we plan what to build next. The most-voted items move up the list.
          </p>
        </div>
        <div className={cn("text-xs whitespace-nowrap hidden sm:block", theme === 'neo' && "font-mono", theme === 'cottagecore' && "text-[#c86b5e]", theme === 'lame' && "text-[#627D98]")}>
          Updated fortnightly
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={cn(
            "px-4 py-2 text-sm transition-all",
            theme === 'neo' && "font-mono uppercase border-2 border-black",
            theme === 'cottagecore' && "font-serif rounded-full border border-[#d2c5b3]",
            theme === 'lame' && "font-display-lame font-bold rounded border border-[#D9E2EC]",
            activeFilter === 'all' 
              ? (theme === 'neo' ? "bg-black text-white" : theme === 'cottagecore' ? "bg-[#2d4a22] text-white" : "bg-[#102A43] text-white")
              : (theme === 'neo' ? "bg-white hover:bg-gray-100" : theme === 'cottagecore' ? "bg-white text-[#5A5A40] hover:bg-[#f4ecd8]" : "bg-white text-[#627D98] hover:bg-[#F0F4F8]")
          )}
        >
          All <span className="opacity-70 ml-1">{ROADMAP_ITEMS.length}</span>
        </button>
        {LANES.map(lane => (
          <button
            key={lane.id}
            onClick={() => setActiveFilter(lane.id)}
            className={cn(
              "px-4 py-2 text-sm transition-all flex items-center gap-2",
              theme === 'neo' && "font-mono uppercase border-2 border-black",
              theme === 'cottagecore' && "font-serif rounded-full border border-[#d2c5b3]",
              theme === 'lame' && "font-display-lame font-bold rounded border border-[#D9E2EC]",
              activeFilter === lane.id
                ? (theme === 'neo' ? "bg-black text-white" : theme === 'cottagecore' ? "bg-[#2d4a22] text-white" : "bg-[#102A43] text-white")
                : (theme === 'neo' ? "bg-white hover:bg-gray-100" : theme === 'cottagecore' ? "bg-white text-[#5A5A40] hover:bg-[#f4ecd8]" : "bg-white text-[#627D98] hover:bg-[#F0F4F8]")
            )}
          >
            <lane.icon className="w-4 h-4" /> {lane.label}
            <span className="opacity-70 ml-1">{ROADMAP_ITEMS.filter(i => i.status === lane.id).length}</span>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 items-start">
        
        {/* Lanes */}
        <div className="space-y-12">
          {filteredLanes.map(lane => {
            const items = ROADMAP_ITEMS
              .filter(i => i.status === lane.id)
              .sort((a, b) => getScore(b) - getScore(a));
            
            if (items.length === 0) return null;

            return (
              <div key={lane.id} className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className={cn(
                    "px-3 py-1 text-xs font-bold flex items-center gap-2",
                    theme === 'neo' && "border-2 border-black uppercase bg-white",
                    theme === 'cottagecore' && "rounded-full bg-[#f4ecd8] text-[#2d4a22]",
                    theme === 'lame' && "rounded bg-[#F0F4F8] text-[#102A43] font-display-lame"
                  )}>
                    <lane.icon className={cn("w-4 h-4", lane.color)} /> {lane.label}
                  </div>
                  <span className={cn("text-sm", theme === 'neo' && "font-mono text-gray-500", theme === 'cottagecore' && "font-serif text-[#c86b5e]", theme === 'lame' && "font-display-lame text-[#627D98]")}>
                    {lane.desc}
                  </span>
                </div>

                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className={cn(
                      "flex gap-4 p-4 sm:p-6 transition-all",
                      theme === 'neo' && "bg-white border-4 border-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
                      theme === 'cottagecore' && "bg-white rounded-2xl border border-[#d2c5b3] hover:shadow-md",
                      theme === 'lame' && "bg-white rounded-lg border border-[#D9E2EC] shadow-sm hover:border-[#BCCCDC]"
                    )}>
                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl leading-none">{item.emoji}</span>
                          <h4 className={cn("text-xl", theme === 'neo' && "font-display-neo uppercase", theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]", theme === 'lame' && "font-display-lame font-bold text-[#102A43]")}>
                            {item.title}
                          </h4>
                        </div>
                        <p className={cn("text-sm ml-9", theme === 'neo' && "font-mono text-gray-600", theme === 'cottagecore' && "text-[#5A5A40]", theme === 'lame' && "font-display-lame text-[#486581]")}>
                          {item.description}
                        </p>
                        <div className="flex flex-wrap gap-2 ml-9">
                          {item.tags.map(tag => (
                            <span key={tag} className={cn(
                              "text-xs px-2 py-1",
                              theme === 'neo' && "bg-gray-100 border border-black font-mono",
                              theme === 'cottagecore' && "bg-[#fdfbf7] border border-[#d2c5b3] text-[#8a9a5b] rounded-full",
                              theme === 'lame' && "bg-[#F0F4F8] text-[#627D98] rounded font-display-lame"
                            )}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        {item.progress !== undefined && (
                          <div className="ml-9 mt-4 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className={cn(theme === 'neo' && "font-mono", theme === 'cottagecore' && "text-[#c86b5e]", theme === 'lame' && "font-display-lame text-[#627D98]")}>Build progress</span>
                              <span className={cn(theme === 'neo' && "font-mono font-bold", theme === 'cottagecore' && "font-bold text-[#2d4a22]", theme === 'lame' && "font-display-lame font-bold text-[#102A43]")}>{item.progress}%</span>
                            </div>
                            <div className={cn("h-2 w-full overflow-hidden", theme === 'neo' && "bg-gray-200 border border-black", theme === 'cottagecore' && "bg-[#f4ecd8] rounded-full", theme === 'lame' && "bg-[#E4E7EB] rounded-full")}>
                              <div className={cn("h-full transition-all duration-1000", theme === 'neo' && "bg-[#ff00ff]", theme === 'cottagecore' && "bg-[#8a9a5b]", theme === 'lame' && "bg-[#00FFFF]")} style={{ width: `${item.progress}%` }} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Vote Widget */}
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <button 
                          onClick={() => handleVote(item.id, 'up')}
                          className={cn(
                            "w-10 h-10 flex items-center justify-center transition-all",
                            theme === 'neo' && "border-2 border-black hover:bg-[#ccff00]",
                            theme === 'cottagecore' && "rounded-full border border-[#d2c5b3] hover:bg-[#f4ecd8]",
                            theme === 'lame' && "rounded border border-[#D9E2EC] hover:bg-[#F0F4F8]",
                            votes[item.id] === 'up' && (theme === 'neo' ? "bg-[#ccff00]" : theme === 'cottagecore' ? "bg-[#e1f9eb] border-[#147d64] text-[#147d64]" : "bg-[#E1F9EB] border-[#147D64] text-[#147D64]")
                          )}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <div className={cn(
                          "font-bold text-sm py-1 min-w-[2.5rem] text-center",
                          theme === 'neo' && "font-mono",
                          theme === 'lame' && "font-display-lame"
                        )}>
                          {getScore(item)}
                        </div>
                        <button 
                          onClick={() => handleVote(item.id, 'down')}
                          className={cn(
                            "w-10 h-10 flex items-center justify-center transition-all",
                            theme === 'neo' && "border-2 border-black hover:bg-[#ff3300] hover:text-white",
                            theme === 'cottagecore' && "rounded-full border border-[#d2c5b3] hover:bg-[#f4ecd8]",
                            theme === 'lame' && "rounded border border-[#D9E2EC] hover:bg-[#F0F4F8]",
                            votes[item.id] === 'down' && (theme === 'neo' ? "bg-[#ff3300] text-white" : theme === 'cottagecore' ? "bg-[#ffe3e3] border-[#d32f2f] text-[#d32f2f]" : "bg-[#FFE3E3] border-[#D32F2F] text-[#D32F2F]")
                          )}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 sticky top-28">
          <div className={cn(
            "p-6",
            theme === 'neo' && "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
            theme === 'cottagecore' && "bg-[#fdfbf7] rounded-2xl border border-[#d2c5b3]",
            theme === 'lame' && "bg-white rounded-lg border border-[#D9E2EC] shadow-sm"
          )}>
            <h3 className={cn("text-xl mb-2", theme === 'neo' && "font-display-neo uppercase", theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]", theme === 'lame' && "font-display-lame font-bold text-[#102A43]")}>
              Got an idea? 💡
            </h3>
            <p className={cn("text-sm mb-6", theme === 'neo' && "font-mono text-gray-600", theme === 'cottagecore' && "text-[#5A5A40]", theme === 'lame' && "font-display-lame text-[#486581]")}>
              Something missing that would make your creative life easier? Tell us. We read every submission.
            </p>
            <button className={cn(
              "w-full py-3 text-sm font-bold transition-all",
              theme === 'neo' && "bg-[#ff00ff] text-white font-display-neo uppercase border-2 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              theme === 'cottagecore' && "bg-[#2d4a22] text-white rounded-full font-serif hover:bg-[#1a2e13]",
              theme === 'lame' && "bg-[#102A43] text-white rounded font-display-lame hover:bg-[#243B53]"
            )}>
              Suggest a Feature
            </button>
          </div>

          <div className={cn(
            "p-6",
            theme === 'neo' && "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
            theme === 'cottagecore' && "bg-[#fdfbf7] rounded-2xl border border-[#d2c5b3]",
            theme === 'lame' && "bg-white rounded-lg border border-[#D9E2EC] shadow-sm"
          )}>
            <h3 className={cn("text-sm uppercase tracking-wider mb-4 pb-2 border-b", theme === 'neo' && "font-mono border-black", theme === 'cottagecore' && "font-serif text-[#c86b5e] border-[#d2c5b3]", theme === 'lame' && "font-display-lame font-bold text-[#627D98] border-[#D9E2EC]")}>
              Roadmap Stats
            </h3>
            <div className="space-y-3">
              {[
                { label: "Total votes cast", value: "1,842", icon: "🗳️" },
                { label: "Features suggested", value: "84", icon: "💡" },
                { label: "Items shipped", value: "3", icon: "✅" },
                { label: "In progress", value: "2", icon: "🔨" },
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className={cn("flex items-center gap-2", theme === 'neo' && "font-mono text-gray-600", theme === 'cottagecore' && "text-[#5A5A40]", theme === 'lame' && "font-display-lame text-[#486581]")}>
                    <span>{stat.icon}</span> {stat.label}
                  </span>
                  <span className={cn("font-bold", theme === 'neo' && "font-mono", theme === 'cottagecore' && "text-[#2d4a22]", theme === 'lame' && "font-display-lame text-[#102A43]")}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
