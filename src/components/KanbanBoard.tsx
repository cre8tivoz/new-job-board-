import React, { useState } from 'react';
import { Application, ApplicationStatus, Job, Theme } from '../types';
import { cn } from '../lib/utils';
import { Trash2, GripVertical, FileText, TrendingUp, Sparkles, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KanbanBoardProps {
  applications: Application[];
  jobs: Job[];
  theme: Theme;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onRemove: (id: string) => void;
  onReorder?: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
}

const COLUMNS: { id: ApplicationStatus; title: string; color: string }[] = [
  { id: 'watchlist', title: 'Watchlist', color: 'bg-gray-200' },
  { id: 'applied', title: 'Applied', color: 'bg-blue-200' },
  { id: 'interviewing', title: 'Interviewing', color: 'bg-yellow-200' },
  { id: 'offer', title: 'Offer', color: 'bg-green-200' },
  { id: 'archived', title: 'Archived', color: 'bg-gray-400' },
];

export function KanbanBoard({
  applications,
  jobs,
  theme,
  onUpdateStatus,
  onUpdateNotes,
  onRemove,
  onReorder,
}: KanbanBoardProps) {
  const isNeo = theme === 'neo';
  const totalCount = applications.length;
  const appliedCount = applications.filter(a => a.status === 'applied').length;
  const interviewingCount = applications.filter(a => a.status === 'interviewing').length;
  const offerCount = applications.filter(a => a.status === 'offer').length;
  const progressedCount = appliedCount + interviewingCount + offerCount;
  const percentage = totalCount > 0 ? Math.round((progressedCount / totalCount) * 100) : 0;

  const ITEMS_PER_PAGE = 10;
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<ApplicationStatus | null>(null);
  const [dragOverAppId, setDragOverAppId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);
  const [columnPages, setColumnPages] = useState<Record<ApplicationStatus, number>>({
    watchlist: 1,
    applied: 1,
    interviewing: 1,
    offer: 1,
    archived: 1,
  });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedAppId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Set a ghost image or just let the browser handle it
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOverColumn = (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    setDragOverColumnId(status);
    // Clear card-level indicators if hovering over empty space in column
    if (e.target === e.currentTarget) {
      setDragOverAppId(null);
      setDropPosition(null);
    }
  };

  const handleDragOverCard = (e: React.DragEvent, appId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (appId === draggedAppId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? 'before' : 'after';
    
    setDragOverAppId(appId);
    setDropPosition(position);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the column/card to something outside
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverAppId(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    if (draggedAppId) {
      if (onReorder && dragOverAppId && dropPosition) {
        onReorder(draggedAppId, dragOverAppId, dropPosition);
      } else {
        onUpdateStatus(draggedAppId, status);
      }
    }
    setDraggedAppId(null);
    setDragOverColumnId(null);
    setDragOverAppId(null);
    setDropPosition(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Progress Indicator Card */}
      {theme === 'neo' && (
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-black" />
                <h3 className="font-bold text-lg uppercase tracking-wider text-black">
                  Board Momentum
                </h3>
              </div>
              <p className="text-xs text-gray-500 uppercase mt-1 font-semibold">
                {progressedCount} of {totalCount} applications in progress
              </p>
            </div>
            <div className="text-3xl font-black text-black bg-[#00FFFF] border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {percentage}%
            </div>
          </div>
          
          <div className="h-6 bg-gray-100 border-4 border-black relative overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-[#00FFFF] border-r-4 border-black"
            />
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-xs font-bold uppercase text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-200 border border-black inline-block" />
              <span>Applied: {appliedCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-200 border border-black inline-block" />
              <span>Interviewing: {interviewingCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-200 border border-black inline-block" />
              <span>Offered: {offerCount}</span>
            </div>
          </div>
        </div>
      )}

      {theme === 'cottagecore' && (
        <div className="bg-[#fdfbf7] border border-[#d2c5b3] rounded-2xl p-6 shadow-sm font-serif text-[#2d4a22]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#2d4a22]" />
                <h3 className="font-display-cottage text-2xl font-bold italic text-[#2d4a22]">
                  Our Nurturing Progress
                </h3>
              </div>
              <p className="text-sm text-[#c86b5e] font-serif italic mt-1">
                {progressedCount} of {totalCount} lovely opportunities are taking root
              </p>
            </div>
            <div className="text-2xl font-bold font-display-cottage text-[#2d4a22] bg-white/40 px-4 py-1.5 rounded-full border border-[#d2c5b3]">
              {percentage}%
            </div>
          </div>
          
          <div className="h-3.5 bg-[#e8dfc8]/40 rounded-full overflow-hidden border border-[#d2c5b3]/30">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-[#2d4a22] rounded-full"
            />
          </div>

          <div className="flex flex-wrap gap-6 mt-4 text-xs italic text-[#2d4a22]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-300 rounded-full" />
              <span>Applied: {appliedCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-yellow-300 rounded-full" />
              <span>Interviewing: {interviewingCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-300 rounded-full" />
              <span>Offered: {offerCount}</span>
            </div>
          </div>
        </div>
      )}

      {theme === 'lame' && (
        <div className="bg-white border border-[#D9E2EC] rounded-xl p-6 shadow-sm font-sans text-[#102A43]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#102A43]" />
                <h3 className="font-display-lame font-bold text-lg text-[#102A43]">
                  Application Pipeline Momentum
                </h3>
              </div>
              <p className="text-sm text-[#486581] font-medium mt-1">
                You have successfully progressed {progressedCount} of your {totalCount} total job applications
              </p>
            </div>
            <div className="text-2xl font-bold font-display-lame text-[#102A43] bg-[#F0F4F8] px-4 py-1.5 rounded-lg border border-[#D9E2EC]">
              {percentage}%
            </div>
          </div>
          
          <div className="h-3 bg-[#F0F4F8] rounded-full overflow-hidden border border-[#D9E2EC]/30">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#243B53] to-[#00FFFF] rounded-full"
            />
          </div>

          <div className="flex flex-wrap gap-6 mt-4 text-xs font-semibold text-[#486581]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded" />
              <span>Applied: {appliedCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded" />
              <span>Interviewing: {interviewingCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded" />
              <span>Offered: {offerCount}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6 overflow-x-auto pb-8 snap-x min-h-[600px]">
        {COLUMNS.map((column) => {
        const columnApps = applications.filter((a) => a.status === column.id);
        const totalPages = Math.ceil(columnApps.length / ITEMS_PER_PAGE);
        const currentPage = columnPages[column.id];
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const visibleApps = columnApps.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        return (
          <div
            key={column.id}
            className={cn(
              "flex-shrink-0 w-80 flex flex-col snap-center transition-all duration-200",
              isNeo
                ? cn("border-4 border-black bg-white", dragOverColumnId === column.id && "bg-gray-100 scale-[1.02] shadow-lg")
                : cn("bg-[#f4ecd8]/50 rounded-2xl p-4 border border-[#d2c5b3]", dragOverColumnId === column.id && "bg-[#f4ecd8]/80 scale-[1.02] shadow-lg")
            )}
            onDragOver={(e) => handleDragOverColumn(e, column.id)}
            onDragLeave={() => setDragOverColumnId(null)}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div
              className={cn(
                "p-4 font-bold flex items-center justify-between",
                isNeo
                  ? `border-b-4 border-black ${column.color} uppercase tracking-wider`
                  : "font-display-cottage text-xl text-[#2d4a22] mb-4"
              )}
            >
              {column.title}
              <span
                className={cn(
                  "text-sm",
                  isNeo ? "bg-black text-white px-2 py-1" : "bg-white/50 px-3 py-1 rounded-full"
                )}
              >
                {columnApps.length}
              </span>
            </div>

            <div className={cn("flex-1 p-4 flex flex-col gap-4 min-h-[150px]", isNeo ? "bg-gray-50/50" : "")}>
              <AnimatePresence mode="popLayout">
                {visibleApps.map((app) => {
                  const job = jobs.find((j) => j.id === app.jobId);
                  if (!job) return null;

                  const isBeingDragged = draggedAppId === app.id;
                  const isDragOver = dragOverAppId === app.id;

                  return (
                    <React.Fragment key={app.id}>
                      {/* Drop Indicator Before */}
                      <AnimatePresence>
                        {isDragOver && dropPosition === 'before' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                            animate={{ height: 120, opacity: 1, marginBottom: 16 }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            className={cn(
                              "w-full border-2 border-dashed flex items-center justify-center",
                              isNeo 
                                ? "border-black bg-gray-100 font-mono text-xs uppercase" 
                                : "border-[#c86b5e] bg-[#f4ecd8]/50 rounded-xl font-serif italic text-sm text-[#c86b5e]"
                            )}
                          >
                            Drop here
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ 
                          opacity: isBeingDragged ? 0 : 1, 
                          scale: isBeingDragged ? 0.9 : 1,
                          y: 0
                        }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        onDragOver={(e) => handleDragOverCard(e, app.id)}
                        onDragLeave={handleDragLeave}
                        className={cn(
                          "group relative cursor-grab active:cursor-grabbing",
                          isNeo
                            ? "bg-white border-2 border-black p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                            : "bg-white p-5 rounded-xl shadow-sm border border-[#d2c5b3] hover:shadow-md transition-shadow"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4
                            className={cn(
                              "font-bold leading-tight pr-6",
                              isNeo ? "font-display-neo uppercase text-sm" : "font-display-cottage text-lg text-[#2d4a22]"
                            )}
                          >
                            {job.title}
                          </h4>
                          <button
                            onClick={() => onRemove(app.id)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove from board"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <p className={cn("text-sm mb-4", isNeo ? "text-gray-600" : "text-[#c86b5e]")}>
                          {job.company}
                        </p>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <FileText className="w-3 h-3" />
                              Notes
                            </div>
                            <select
                              value={app.status}
                              onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                              className={cn(
                                "text-xs p-1 outline-none cursor-pointer",
                                theme === 'neo' && "border-2 border-black font-mono bg-white",
                                theme === 'cottagecore' && "border border-[#d2c5b3] rounded-md bg-[#fdfbf7] text-[#2d4a22]",
                                theme === 'lame' && "border border-[#D9E2EC] rounded bg-[#F0F4F8] text-[#486581] font-display-lame"
                              )}
                            >
                              {COLUMNS.map(col => (
                                <option key={col.id} value={col.id}>{col.title}</option>
                              ))}
                            </select>
                          </div>
                          <textarea
                            value={app.notes}
                            onChange={(e) => onUpdateNotes(app.id, e.target.value)}
                            placeholder="Add notes..."
                            className={cn(
                              "w-full text-sm resize-none outline-none bg-transparent mb-2",
                              isNeo
                                ? "border-2 border-transparent focus:border-black p-2 transition-colors"
                                : "focus:bg-[#f4ecd8]/30 p-2 rounded-lg transition-colors"
                            )}
                            rows={3}
                          />
                          
                          {app.status === 'watchlist' && (
                            <button
                              onClick={() => onUpdateStatus(app.id, 'applied')}
                              className={cn(
                                "w-full py-2 text-xs font-bold transition-all",
                                theme === 'neo' && "bg-black text-white hover:bg-[#00FFFF] hover:text-black uppercase tracking-wider",
                                theme === 'cottagecore' && "bg-[#2d4a22] text-white rounded-full hover:bg-[#1a2e13]",
                                theme === 'lame' && "bg-[#102A43] text-white rounded hover:bg-[#243B53]"
                              )}
                            >
                              Mark as Applied
                            </button>
                          )}
                          {app.status === 'applied' && (
                            <button
                              onClick={() => onUpdateStatus(app.id, 'watchlist')}
                              className={cn(
                                "w-full py-2 text-xs font-bold transition-all",
                                theme === 'neo' && "bg-white text-black border-2 border-black hover:bg-gray-100 uppercase tracking-wider",
                                theme === 'cottagecore' && "bg-transparent text-[#2d4a22] border border-[#2d4a22] rounded-full hover:bg-[#f4ecd8]",
                                theme === 'lame' && "bg-white text-[#102A43] border border-[#BCCCDC] rounded hover:bg-[#F0F4F8]"
                              )}
                            >
                              Move to Watchlist
                            </button>
                          )}
                        </div>
                        
                        <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                          <GripVertical className="w-4 h-4 text-gray-300" />
                        </div>
                      </motion.div>

                      {/* Drop Indicator After */}
                      <AnimatePresence>
                        {isDragOver && dropPosition === 'after' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 120, opacity: 1, marginTop: 16 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className={cn(
                              "w-full border-2 border-dashed flex items-center justify-center",
                              isNeo 
                                ? "border-black bg-gray-100 font-mono text-xs uppercase" 
                                : "border-[#c86b5e] bg-[#f4ecd8]/50 rounded-xl font-serif italic text-sm text-[#c86b5e]"
                            )}
                          >
                            Drop here
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className={cn(
                "p-4 border-t flex items-center justify-between",
                isNeo ? "border-black" : "border-[#d2c5b3]"
              )}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setColumnPages(prev => ({ ...prev, [column.id]: prev[column.id] - 1 }))}
                  className={cn(
                    "px-3 py-1 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed",
                    isNeo 
                      ? "bg-white border-2 border-black hover:bg-black hover:text-white uppercase" 
                      : "bg-[#f4ecd8] text-[#2d4a22] rounded-full hover:bg-[#e8dfc8]"
                  )}
                >
                  Prev
                </button>
                <span className={cn(
                  "text-xs font-bold",
                  isNeo ? "font-mono" : "font-serif italic"
                )}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setColumnPages(prev => ({ ...prev, [column.id]: prev[column.id] + 1 }))}
                  className={cn(
                    "px-3 py-1 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed",
                    isNeo 
                      ? "bg-white border-2 border-black hover:bg-black hover:text-white uppercase" 
                      : "bg-[#f4ecd8] text-[#2d4a22] rounded-full hover:bg-[#e8dfc8]"
                  )}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
