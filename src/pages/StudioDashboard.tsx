import React from 'react';
import { Theme } from '../types';
import { cn } from '../lib/utils';
import { BarChart3, Eye, Users, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StudioDashboardProps {
  theme: Theme;
}

export function StudioDashboard({ theme }: StudioDashboardProps) {
  const metrics = [
    { label: "Active Jobs", value: "3", icon: Briefcase },
    { label: "Total Views", value: "12.4k", icon: Eye },
    { label: "Applications", value: "142", icon: Users },
    { label: "Hires Made", value: "5", icon: CheckCircle },
  ];

  const activeJobs = [
    { title: "Senior Brand Designer", views: 4200, apps: 45, status: "Active" },
    { title: "UX/UI Designer", views: 3100, apps: 62, status: "Active" },
    { title: "Digital Art Director", views: 5100, apps: 35, status: "Interviewing" },
  ];

  const chartData = [
    { name: 'Oct', jobs: 2 },
    { name: 'Nov', jobs: 4 },
    { name: 'Dec', jobs: 3 },
    { name: 'Jan', jobs: 6 },
    { name: 'Feb', jobs: 8 },
    { name: 'Mar', jobs: 12 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className={cn(
          "text-3xl sm:text-4xl md:text-5xl",
          theme === 'neo' && "font-display-neo uppercase",
          theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]",
          theme === 'lame' && "font-display-lame font-black tracking-tight text-[#102A43]"
        )}>
          {theme === 'lame' ? "Recruitment Analytics" : "Studio Dashboard"}
        </h1>
        <button className={cn(
          "px-6 py-2 transition-all",
          theme === 'neo' && "bg-[#ccff00] text-black font-display-neo uppercase border-4 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          theme === 'cottagecore' && "bg-[#2d4a22] text-white rounded-full font-serif hover:bg-[#1a2e13]",
          theme === 'lame' && "bg-[#102A43] text-white rounded-md font-display-lame font-bold hover:bg-[#243B53] shadow-sm"
        )}>
          Post New Role
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className={cn(
            "p-6",
            theme === 'neo' && "bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
            theme === 'cottagecore' && "bg-[#fdfbf7] rounded-2xl border border-[#d2c5b3]",
            theme === 'lame' && "bg-white rounded-lg border border-[#D9E2EC] shadow-sm"
          )}>
            <div className="flex items-center justify-between mb-4">
              <span className={cn("text-sm font-medium", theme === 'neo' ? "font-mono text-gray-500" : theme === 'lame' ? "font-display-lame text-[#627D98]" : "text-[#8a9a5b]")}>{m.label}</span>
              <m.icon className={cn("w-5 h-5", theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#00FFFF]" : "text-[#c86b5e]")} />
            </div>
            <div className={cn("text-4xl", theme === 'neo' && "font-display-neo", theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]", theme === 'lame' && "font-display-lame font-black text-[#102A43]")}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      <div className={cn(
        "overflow-hidden",
        theme === 'neo' && "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        theme === 'cottagecore' && "bg-white rounded-2xl border border-[#d2c5b3]",
        theme === 'lame' && "bg-white rounded-lg border border-[#D9E2EC] shadow-sm"
      )}>
        <div className={cn("p-6 border-b", theme === 'neo' ? "border-black" : theme === 'lame' ? "border-[#D9E2EC] bg-[#F0F4F8]" : "border-[#d2c5b3]")}>
          <h2 className={cn("text-2xl", theme === 'neo' && "font-display-neo uppercase", theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]", theme === 'lame' && "font-display-lame font-bold text-[#102A43]")}>
            {theme === 'lame' ? "Active Vacancies" : "Current Listings"}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={cn("border-b", theme === 'neo' ? "border-black bg-gray-50 font-mono text-sm" : theme === 'lame' ? "border-[#D9E2EC] bg-[#F0F4F8] font-display-lame text-sm text-[#486581]" : "border-[#d2c5b3] bg-[#f4ecd8]/50 text-[#8a9a5b]")}>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Views</th>
                <th className="p-4 font-medium">Applications</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeJobs.map((job, i) => (
                <tr key={i} className={cn("border-b last:border-0", theme === 'neo' ? "border-black" : theme === 'lame' ? "border-[#D9E2EC]" : "border-[#d2c5b3]")}>
                  <td className={cn("p-4 font-medium", theme === 'lame' && "font-display-lame text-[#102A43]")}>{job.title}</td>
                  <td className="p-4">
                    <span className={cn(
                      "px-3 py-1 text-xs font-bold",
                      theme === 'neo' && (job.status === 'Active' ? "bg-[#ccff00] border-2 border-black uppercase" : "bg-yellow-300 border-2 border-black uppercase"),
                      theme === 'cottagecore' && (job.status === 'Active' ? "bg-green-100 text-green-800 rounded-full" : "bg-yellow-100 text-yellow-800 rounded-full"),
                      theme === 'lame' && (job.status === 'Active' ? "bg-[#E1F9EB] text-[#147D64] rounded-md" : "bg-[#FFF3C4] text-[#8D6E10] rounded-md")
                    )}>
                      {job.status}
                    </span>
                  </td>
                  <td className={cn("p-4", theme === 'neo' ? "font-mono" : theme === 'lame' ? "font-display-lame text-[#486581]" : "font-mono")}>{job.views.toLocaleString()}</td>
                  <td className={cn("p-4", theme === 'neo' ? "font-mono" : theme === 'lame' ? "font-display-lame text-[#486581]" : "font-mono")}>{job.apps}</td>
                  <td className="p-4">
                    <button className={cn("text-sm underline", theme === 'neo' ? "font-mono hover:text-[#ff00ff]" : theme === 'lame' ? "font-display-lame text-[#102A43] hover:text-[#00FFFF]" : "text-[#c86b5e] hover:text-[#2d4a22]")}>
                      View Apps
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={cn("p-4 text-center text-sm", theme === 'neo' ? "bg-black text-white font-mono" : theme === 'lame' ? "bg-[#102A43] text-[#BCCCDC] font-display-lame" : "bg-[#f4ecd8] text-[#5A5A40]")}>
          Average conversion rate: 3.4% (Industry average: 1.2%)
        </div>
      </div>

      <div className={cn(
        "p-6",
        theme === 'neo' && "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        theme === 'cottagecore' && "bg-white rounded-2xl border border-[#d2c5b3]",
        theme === 'lame' && "bg-white rounded-lg border border-[#D9E2EC] shadow-sm"
      )}>
        <div className="mb-6 flex items-center gap-2">
          <BarChart3 className={cn("w-6 h-6", theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#102A43]" : "text-[#2d4a22]")} />
          <h2 className={cn("text-2xl", theme === 'neo' && "font-display-neo uppercase", theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]", theme === 'lame' && "font-display-lame font-bold text-[#102A43]")}>
            {theme === 'lame' ? "Listing Volume Trends" : "Jobs Listed Over Time"}
          </h2>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'lame' ? '#D9E2EC' : theme === 'neo' ? '#000' : '#d2c5b3'} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme === 'lame' ? '#627D98' : theme === 'neo' ? '#000' : '#8a9a5b', fontSize: 12, fontFamily: theme === 'lame' ? 'Inter' : theme === 'neo' ? 'Space Mono' : 'Cormorant Garamond' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme === 'lame' ? '#627D98' : theme === 'neo' ? '#000' : '#8a9a5b', fontSize: 12, fontFamily: theme === 'lame' ? 'Inter' : theme === 'neo' ? 'Space Mono' : 'Cormorant Garamond' }}
              />
              <Tooltip 
                cursor={{ fill: theme === 'lame' ? '#F0F4F8' : theme === 'neo' ? '#f3f4f6' : '#f4ecd8' }}
                contentStyle={{ 
                  backgroundColor: theme === 'lame' ? '#102A43' : theme === 'neo' ? '#000' : '#fdfbf7',
                  borderColor: theme === 'lame' ? '#102A43' : theme === 'neo' ? '#000' : '#d2c5b3',
                  color: theme === 'lame' ? '#fff' : theme === 'neo' ? '#00FFFF' : '#2d4a22',
                  fontFamily: theme === 'lame' ? 'Inter' : theme === 'neo' ? 'Space Mono' : 'Cormorant Garamond',
                  borderRadius: theme === 'lame' ? '6px' : theme === 'neo' ? '0px' : '12px',
                  boxShadow: theme === 'neo' ? '4px 4px 0px 0px rgba(0,255,255,1)' : 'none'
                }}
                itemStyle={{ color: theme === 'lame' ? '#00FFFF' : theme === 'neo' ? '#FF00FF' : '#c86b5e' }}
              />
              <Bar 
                dataKey="jobs" 
                fill={theme === 'lame' ? '#102A43' : theme === 'neo' ? '#000' : '#8a9a5b'} 
                radius={theme === 'lame' ? [4, 4, 0, 0] : theme === 'neo' ? [0, 0, 0, 0] : [6, 6, 0, 0]}
                activeBar={{ fill: theme === 'lame' ? '#00FFFF' : theme === 'neo' ? '#FF00FF' : '#c86b5e' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Briefcase(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
}
