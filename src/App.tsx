import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { Theme, Application, ApplicationStatus } from './types';
import { MOCK_JOBS } from './data/mockJobs';
import { KanbanBoard } from './components/KanbanBoard';
import { ThemeToggle } from './components/ThemeToggle';
import { LandingPage } from './pages/LandingPage';
import { BrowseJobs } from './pages/BrowseJobs';
import { JobDetail } from './pages/JobDetail';
import { TalentPassport } from './pages/TalentPassport';
import { LoginPage } from './pages/LoginPage';
import { StudioDashboard } from './pages/StudioDashboard';
import { PostJob } from './pages/PostJob';
import { CreationWizard } from './pages/CreationWizard';
import { Transparency } from './pages/Transparency';
import { FAQ } from './pages/FAQ';
import { Ticker } from './components/Ticker';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { UserMenu } from './components/UserMenu';
import { cn } from './lib/utils';
import { Briefcase, LayoutDashboard, PlusCircle, Menu, X, Building2, Plus } from 'lucide-react';

type Tab = 'home' | 'jobs' | 'board' | 'passport' | 'create_passport' | 'studio' | 'post' | 'transparency' | 'faq';

function AppContent() {
  const [theme, setTheme] = useState<Theme>('neo');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Derive activeTab from location
  const activeTab = (location.pathname.split('/')[1] || 'home') as Tab;
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('cre8tiv_applications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoadingJobs(true);
        setFetchError(null);
        const res = await fetch('/api/jobs');
        if (res.ok) {
          const data = await res.json();
          if (data.jobs && data.jobs.length > 0) {
            setJobs(data.jobs);
          } else {
            setFetchError("No live jobs found. Showing example data.");
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          setFetchError(errData.error || "Failed to connect to live job board. Showing example data.");
        }
      } catch (err) {
        console.error("Failed to fetch live jobs, falling back to mock data", err);
        setFetchError("Network error while fetching live jobs. Showing example data.");
      } finally {
        setIsLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    localStorage.setItem('cre8tiv_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSaveJob = (jobId: string) => {
    if (!applications.find(a => a.jobId === jobId)) {
      setApplications(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          jobId,
          status: 'watchlist',
          notes: '',
          addedAt: Date.now()
        }
      ]);
      navigate('/board');
    }
  };

  const handleUpdateStatus = (id: string, status: ApplicationStatus) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, status } : app
    ));
  };

  const handleReorder = (draggedId: string, targetId: string, position: 'before' | 'after') => {
    setApplications(prev => {
      const draggedApp = prev.find(a => a.id === draggedId);
      if (!draggedApp) return prev;

      const targetApp = prev.find(a => a.id === targetId);
      if (!targetApp) return prev;

      // Filter out the dragged app
      const filtered = prev.filter(a => a.id !== draggedId);
      
      // Find new position
      const targetIndex = filtered.findIndex(a => a.id === targetId);
      const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;

      // Create new array with updated status if it changed
      const updatedApp = { ...draggedApp, status: targetApp.status };
      
      const result = [...filtered];
      result.splice(insertIndex, 0, updatedApp);
      return result;
    });
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, notes } : app
    ));
  };

  const handleRemoveApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };

  const navLinks = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'jobs', label: 'Find Roles', path: '/jobs' },
    { id: 'board', label: 'My Board', path: '/board' },
    { id: 'passport', label: 'Talent Passport', path: '/passport' },
    { id: 'create_passport', label: 'Create Passport', path: '/create_passport' },
    { id: 'studio', label: 'Studio Dashboard', path: '/studio' },
    { id: 'transparency', label: 'Transparency', path: '/transparency' },
    { id: 'faq', label: 'FAQ', path: '/faq' },
  ] as const;

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500",
      theme === 'neo' && "bg-[#FFFF00] text-black",
      theme === 'cottagecore' && "bg-[#fdfbf7] text-[#2d4a22] bg-[radial-gradient(ellipse_at_10%_20%,rgba(122,155,106,0.10)_0%,transparent_50%),radial-gradient(ellipse_at_90%_80%,rgba(196,132,154,0.08)_0%,transparent_50%)]",
      theme === 'lame' && "bg-[#F0F4F8] text-[#102A43] bg-[radial-gradient(#D9E2EC_1px,transparent_1px)] [background-size:20px_20px] bg-fixed"
    )}>
      <header className={cn(
        "sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300",
        theme === 'neo' && (isScrolled ? "bg-white border-black border-b-4 shadow-md" : "bg-white/90 border-black border-b-4"),
        theme === 'cottagecore' && (isScrolled ? "bg-[#fdfbf7] border-[#d2c5b3] shadow-sm" : "bg-[#fdfbf7]/90 border-[#d2c5b3]"),
        theme === 'lame' && (isScrolled ? "bg-[#0B1D33] border-[#334E68] shadow-lg" : "bg-[#0B1D33]/95 border-[#334E68] text-white")
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className={cn(
              "text-3xl",
              theme === 'neo' && "font-display-neo font-bold uppercase tracking-tighter",
              theme === 'cottagecore' && "font-display-cottage font-bold italic text-[#2d4a22] drop-shadow-[2px_2px_0px_#d2c5b3]",
              theme === 'lame' && "font-display-lame font-black tracking-tighter text-white flex items-center gap-2"
            )}>
              {theme === 'lame' && (
                <div className="w-8 h-8 bg-[#00FFFF] rounded-sm flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#102A43]" />
                </div>
              )}
              Cre8tiv Jobs
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:gap-6">
            <div className="hidden lg:flex items-center gap-6">
              <nav className="flex items-center gap-2">
                {navLinks.map(link => (
                  <Link
                    key={link.id}
                    to={link.path}
                    className={cn(
                      "px-3 py-2 transition-all",
                      theme === 'neo' && `font-display-neo font-bold uppercase border-2 border-transparent hover:border-black ${activeTab === link.id ? 'bg-black text-white' : ''}`,
                      theme === 'cottagecore' && `font-serif rounded-full hover:bg-[#f4ecd8] ${activeTab === link.id ? 'bg-[#f4ecd8] text-[#5A5A40]' : ''}`,
                      theme === 'lame' && `font-display-lame font-bold tracking-tight hover:text-[#00FFFF] ${activeTab === link.id ? 'text-[#00FFFF] border-b-2 border-[#00FFFF]' : 'text-gray-300'}`
                    )}
                  >
                    {link.label}
                    {link.id === 'board' && applications.length > 0 && (
                      <span className={cn(
                        "ml-2 text-xs px-2 py-0.5",
                        theme === 'neo' && "bg-[#ccff00] text-black border border-black",
                        theme === 'cottagecore' && "bg-[#c86b5e] text-white rounded-full",
                        theme === 'lame' && "bg-[#00FFFF] text-[#102A43] rounded-sm font-bold"
                      )}>
                        {applications.length}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>

              <div className={cn(
                "h-8 w-px",
                theme === 'lame' ? "bg-gray-600" : "bg-gray-300"
              )} />
            </div>
            
            <div className="flex items-center gap-2">
              <UserMenu theme={theme} />
              <ThemeToggle theme={theme} onChange={setTheme} />
              
              <Link 
                to="/post"
                className={cn(
                  "hidden sm:flex items-center gap-2 px-6 py-2 transition-all",
                  theme === 'neo' && "bg-[#ff00ff] text-white font-display-neo font-bold uppercase border-4 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                  theme === 'cottagecore' && "bg-[#2d4a22] text-[#fdfbf7] font-serif rounded-full hover:bg-[#1a2e13] shadow-md",
                  theme === 'lame' && "bg-[#00FFFF] text-[#102A43] font-display-lame font-bold tracking-tight rounded-md hover:bg-[#33FFFF] shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                )}
              >
                {theme === 'lame' ? <Plus className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                <span className="hidden md:inline">Post a Job</span>
              </Link>

              <button 
                className="lg:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={cn(
            "lg:hidden absolute top-20 left-0 right-0 border-b p-4 flex flex-col gap-4",
            theme === 'neo' && "bg-white border-black border-b-4",
            theme === 'cottagecore' && "bg-[#fdfbf7] border-[#d2c5b3]",
            theme === 'lame' && "bg-[#0B1D33] border-[#334E68]"
          )}>
            {navLinks.map(link => (
              <Link
                key={link.id}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "px-4 py-3 text-left transition-all",
                  theme === 'neo' && `font-display-neo font-bold uppercase border-2 border-transparent hover:border-black ${activeTab === link.id ? 'bg-black text-white' : ''}`,
                  theme === 'cottagecore' && `font-serif rounded-xl hover:bg-[#f4ecd8] ${activeTab === link.id ? 'bg-[#f4ecd8] text-[#5A5A40]' : ''}`,
                  theme === 'lame' && `font-display-lame font-semibold tracking-tight hover:text-[#00FFFF] ${activeTab === link.id ? 'text-[#00FFFF] bg-[#1a3a5a]' : 'text-gray-300'}`
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className={cn(
              "flex items-center justify-end pt-4 border-t",
              theme === 'lame' ? "border-gray-600" : "border-gray-200"
            )}>
              <Link 
                to="/post"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 transition-all",
                  theme === 'neo' && "bg-[#ff00ff] text-white font-display-neo font-bold uppercase border-4 border-black",
                  theme === 'cottagecore' && "bg-[#2d4a22] text-[#fdfbf7] font-serif rounded-full",
                  theme === 'lame' && "bg-[#00FFFF] text-[#102A43] font-display-lame font-bold tracking-tight rounded-md"
                )}
              >
                {theme === 'lame' ? <Plus className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                Post a Job
              </Link>
            </div>
          </div>
        )}
      </header>

      <Ticker theme={theme} />

      <main className={cn(
        "max-w-7xl px-2 sm:px-6 lg:px-8 py-12 pb-32 lg:pb-12",
        theme === 'lame' ? "mx-2 md:mx-auto bg-white/80 backdrop-blur-sm rounded-xl mt-8 mb-24 border border-[#D9E2EC] shadow-sm" : "mx-auto"
      )}>
        <Routes>
          <Route path="/" element={<LandingPage theme={theme} onNavigate={(tab) => navigate('/' + tab)} />} />
          <Route path="/home" element={<LandingPage theme={theme} onNavigate={(tab) => navigate('/' + tab)} />} />
          <Route path="/jobs" element={
            <BrowseJobs 
              jobs={jobs} 
              theme={theme} 
              onSaveJob={handleSaveJob} 
              savedJobIds={applications.map(a => a.jobId)} 
              isLoading={isLoadingJobs}
              error={fetchError}
            />
          } />
          <Route path="/jobs/:jobId" element={
            <JobDetail 
              jobs={jobs} 
              theme={theme} 
              onSaveJob={handleSaveJob} 
              savedJobIds={applications.map(a => a.jobId)} 
            />
          } />
          <Route path="/board" element={
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={cn(
                    "text-4xl mb-2",
                    theme === 'neo' && "font-display-neo font-black uppercase tracking-tighter",
                    theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]",
                    theme === 'lame' && "font-display-lame font-black tracking-tight text-[#102A43]"
                  )}>
                    My Board
                  </h2>
                  <p className={cn(
                    "text-lg",
                    theme === 'neo' && "font-mono font-medium text-gray-600",
                    theme === 'cottagecore' && "font-serif italic text-[#c86b5e]",
                    theme === 'lame' && "font-display-lame font-medium text-[#486581]"
                  )}>
                    Drag jobs between columns to track your applications. Notes are saved locally.
                  </p>
                </div>
              </div>

              <KanbanBoard
                applications={applications}
                jobs={jobs}
                theme={theme}
                onUpdateStatus={handleUpdateStatus}
                onUpdateNotes={handleUpdateNotes}
                onRemove={handleRemoveApplication}
                onReorder={handleReorder}
              />
            </div>
          } />
          <Route path="/passport" element={<TalentPassport theme={theme} />} />
          <Route path="/login" element={<LoginPage theme={theme} />} />
          <Route path="/create_passport" element={<CreationWizard theme={theme} />} />
          <Route path="/studio" element={<StudioDashboard theme={theme} />} />
          <Route path="/post" element={<PostJob theme={theme} />} />
          <Route path="/transparency" element={<Transparency theme={theme} />} />
          <Route path="/faq" element={<FAQ theme={theme} />} />
        </Routes>
      </main>
      <Footer theme={theme} />
      <MobileBottomNav theme={theme} applicationCount={applications.length} />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
