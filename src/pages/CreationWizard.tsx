import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Theme } from '../types';
import { cn } from '../lib/utils';
import { Upload, Eye, Image as ImageIcon, Sparkles, Loader2, X, FileText, AlertCircle } from 'lucide-react';
import { usePassport } from '../PassportContext';
import { loginWithGoogle } from '../firebase';
import { GoogleGenAI, Type } from "@google/genai";
import { LogIn } from 'lucide-react';

interface CreationWizardProps {
  theme: Theme;
}

export function CreationWizard({ theme }: CreationWizardProps) {
  const { passportData, updatePassportData, user, isAuthReady } = usePassport();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [cvText, setCvText] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    updatePassportData({ [name]: value });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!passportData.name?.trim()) {
      errors.name = 'Name is required';
    } else if (passportData.name.length > 50) {
      errors.name = 'Name must be 50 characters or less';
    }

    if (!passportData.title?.trim()) {
      errors.title = 'Professional title is required';
    } else if (passportData.title.length > 100) {
      errors.title = 'Title must be 100 characters or less';
    }

    if (!passportData.location?.trim()) {
      errors.location = 'Location is required';
    } else if (passportData.location.length > 100) {
      errors.location = 'Location must be 100 characters or less';
    }

    if (!passportData.experience?.trim()) {
      errors.experience = 'Experience is required';
    } else if (passportData.experience.length > 50) {
      errors.experience = 'Experience must be 50 characters or less';
    }

    if (!passportData.bio?.trim()) {
      errors.bio = 'Bio is required';
    } else if (passportData.bio.length > 500) {
      errors.bio = 'Bio must be 500 characters or less';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(Array.from(files));
    }
  };

  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setResumeError(null);
    
    if (file) {
      const isAllowedType = file.type === 'application/pdf' || 
                            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const isUnder5MB = file.size <= 5 * 1024 * 1024;

      if (!isAllowedType) {
        setResumeError('Please upload a PDF or DOCX file.');
        return;
      }

      if (!isUnder5MB) {
        setResumeError('File size must be less than 5MB.');
        return;
      }

      updatePassportData({
        resume: {
          name: file.name,
          url: URL.createObjectURL(file)
        }
      });
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAvatarError(null);

    if (file) {
      const isImage = file.type.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024;

      if (!isImage) {
        setAvatarError('Please upload an image file.');
        return;
      }

      if (!isUnder5MB) {
        setAvatarError('File size must be less than 5MB.');
        return;
      }

      updatePassportData({
        avatarUrl: URL.createObjectURL(file)
      });
    }
  };

  const removeResume = () => {
    updatePassportData({ resume: null });
  };

  const processFiles = (files: File[]) => {
    setImageError(null);
    const validImages = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024;
      return isImage && isUnder5MB;
    });

    if (validImages.length < files.length) {
      setImageError('Some files were skipped. Please ensure they are images and under 5MB.');
    }

    if (validImages.length === 0) return;

    const newProjects = validImages.slice(0, 6 - passportData.projects.length).map((file, index) => ({
      id: Date.now() + index,
      title: file.name.split('.')[0],
      img: URL.createObjectURL(file)
    }));

    updatePassportData({
      projects: [...passportData.projects, ...newProjects].slice(0, 6)
    });
  };

  const removeProject = (id: number) => {
    updatePassportData({
      projects: passportData.projects.filter(p => p.id !== id)
    });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      processFiles(Array.from(files));
    }
  };

  const handleMagicFill = async () => {
    if (!cvText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract professional details from the following CV text and return them in JSON format. 
        Fields: name, title, location, experience, bio.
        CV Text: ${cvText}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              title: { type: Type.STRING },
              location: { type: Type.STRING },
              experience: { type: Type.STRING },
              bio: { type: Type.STRING },
            },
            required: ["name", "title", "location", "experience", "bio"],
          },
        },
      });

      const result = JSON.parse(response.text || '{}');
      updatePassportData(result);
      setHighlightedFields(Object.keys(result));
      
      // Clear highlights after 4 seconds
      setTimeout(() => {
        setHighlightedFields([]);
      }, 4000);

      setShowAiInput(false);
      setCvText('');
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!validateForm()) {
      // Scroll to the first error
      const firstError = Object.keys(validationErrors)[0];
      const element = document.getElementsByName(firstError)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsPublishing(true);
    try {
      // Ensure all current data is saved one last time
      await updatePassportData(passportData);
      // Navigate to the passport view
      navigate('/passport');
    } catch (error) {
      console.error('Failed to publish passport:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-6">
        <div className={cn(
          "p-12 space-y-8",
          theme === 'neo' && "bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]",
          theme === 'cottagecore' && "bg-[#fdfbf7] rounded-[3rem] border-2 border-[#d2c5b3] shadow-sm",
          theme === 'lame' && "bg-white rounded-xl border border-[#D9E2EC] shadow-lg"
        )}>
          <div className={cn(
            "w-20 h-20 mx-auto flex items-center justify-center",
            theme === 'neo' && "bg-[#ccff00] border-4 border-black",
            theme === 'cottagecore' && "bg-[#f4ecd8] rounded-full",
            theme === 'lame' && "bg-[#F0F4F8] rounded-full"
          )}>
            <LogIn className={cn("w-10 h-10", theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#102A43]" : "text-[#2d4a22]")} />
          </div>
          <div className="space-y-4">
            <h2 className={cn(
              "text-3xl md:text-4xl",
              theme === 'neo' && "font-display-neo uppercase",
              theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]",
              theme === 'lame' && "font-display-lame font-black tracking-tight text-[#102A43]"
            )}>
              Authentication Required
            </h2>
            <p className={cn(
              "text-lg opacity-70",
              theme === 'neo' && "font-mono",
              theme === 'cottagecore' && "font-serif",
              theme === 'lame' && "font-display-lame"
            )}>
              Please log in to create and save your Talent Passport. Your data will be synced across all your devices.
            </p>
          </div>
          <button
            onClick={() => navigate('/login', { state: { from: location } })}
            className={cn(
              "w-full py-4 text-xl transition-all flex items-center justify-center gap-3",
              theme === 'neo' && "bg-black text-white font-display-neo uppercase border-4 border-black hover:bg-[#ccff00] hover:text-black",
              theme === 'cottagecore' && "bg-[#2d4a22] text-white rounded-full font-serif hover:bg-[#1a2e13]",
              theme === 'lame' && "bg-[#102A43] text-white rounded-md font-display-lame hover:bg-[#243B53]"
            )}
          >
            <LogIn className="w-6 h-6" />
            Sign in to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 flex flex-col lg:flex-row gap-12">
      {/* Form Section */}
      <div className="flex-1 space-y-8">
        <div>
          <h1 className={cn(
            "text-4xl md:text-5xl mb-4",
            theme === 'neo' && "font-display-neo uppercase",
            theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]",
            theme === 'lame' && "font-display-lame font-black tracking-tight text-[#102A43]"
          )}>
            {theme === 'lame' ? "Profile Configuration" : "Create Your Passport"}
          </h1>
          <p className={cn("text-xl mb-6", theme === 'neo' && "font-mono", theme === 'cottagecore' && "font-serif text-[#c86b5e]", theme === 'lame' && "font-display-lame text-[#486581]")}>
            {theme === 'lame' 
              ? "Input your professional details below. The preview will update in real-time."
              : "Build your beautiful, shareable profile. What you see on the right is exactly what studios will see."}
          </p>

          <button 
            onClick={() => setShowAiInput(!showAiInput)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 transition-all mb-8",
              theme === 'neo' && "bg-[#ccff00] text-black font-display-neo uppercase border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              theme === 'cottagecore' && "bg-[#f4ecd8] text-[#2d4a22] rounded-full font-serif border border-[#d2c5b3] hover:bg-[#e8dfc8]",
              theme === 'lame' && "bg-[#00FFFF] text-[#102A43] rounded-md font-display-lame font-bold hover:bg-[#00E5E5]"
            )}
          >
            <Sparkles className="w-5 h-5" />
            {showAiInput ? "Close Magic Fill" : "Magic Fill from CV"}
          </button>

          {showAiInput && (
            <div className={cn(
              "p-6 mb-8 space-y-4",
              theme === 'neo' && "bg-black text-white border-4 border-[#ccff00]",
              theme === 'cottagecore' && "bg-[#fdfbf7] border-2 border-dashed border-[#8a9a5b] rounded-2xl",
              theme === 'lame' && "bg-[#102A43] text-white rounded-lg border border-[#334E68]"
            )}>
              <h3 className={cn("text-xl font-bold", theme === 'neo' && "uppercase")}>Paste your CV text here</h3>
              <textarea 
                rows={5} 
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste your CV content..."
                className={cn(
                  "w-full p-4 outline-none resize-none bg-white/10 text-white",
                  theme === 'neo' && "border-2 border-[#ccff00] font-mono",
                  theme === 'cottagecore' && "rounded-xl border border-[#d2c5b3] text-[#2d4a22] bg-white",
                  theme === 'lame' && "rounded-md border border-[#334E68] font-display-lame"
                )}
              />
              <button 
                onClick={handleMagicFill}
                disabled={isAnalyzing || !cvText.trim()}
                className={cn(
                  "w-full py-4 flex items-center justify-center gap-2 transition-all",
                  isAnalyzing && "opacity-50 cursor-not-allowed",
                  theme === 'neo' && "bg-[#ccff00] text-black font-bold uppercase",
                  theme === 'cottagecore' && "bg-[#2d4a22] text-white rounded-full",
                  theme === 'lame' && "bg-[#00FFFF] text-[#102A43] rounded-md font-bold"
                )}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing CV...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Apply Magic
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <form className="space-y-6" onSubmit={handlePublish}>
          <div className="space-y-4">
            <label className={cn("block font-bold", theme === 'neo' && "font-display-neo uppercase text-xl", theme === 'cottagecore' && "font-serif text-[#2d4a22]", theme === 'lame' && "font-display-lame text-[#102A43]")}>
              Profile Picture
            </label>
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-24 h-24 flex-shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden relative group",
                theme === 'neo' && "border-4 border-black",
                theme === 'cottagecore' && "rounded-full border-2 border-[#d2c5b3]",
                theme === 'lame' && "rounded-md border border-[#BCCCDC]"
              )}>
                {passportData.avatarUrl ? (
                  <img src={passportData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                )}
                <button 
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Upload className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-2">
                <button 
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className={cn(
                    "px-4 py-2 text-sm font-bold transition-all",
                    theme === 'neo' && "bg-black text-white hover:bg-[#ccff00] hover:text-black uppercase",
                    theme === 'cottagecore' && "bg-[#f4ecd8] text-[#2d4a22] rounded-full hover:bg-[#e8dfc8]",
                    theme === 'lame' && "bg-white text-[#102A43] border border-[#BCCCDC] rounded hover:bg-[#F0F4F8]"
                  )}
                >
                  Change Photo
                </button>
                <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 5MB.</p>
                {avatarError && (
                  <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {avatarError}
                  </p>
                )}
              </div>
              <input 
                type="file" 
                ref={avatarInputRef}
                onChange={handleAvatarSelect}
                accept="image/*"
                className="hidden" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className={cn("block font-bold", theme === 'neo' && "font-display-neo uppercase text-xl", theme === 'cottagecore' && "font-serif text-[#2d4a22]", theme === 'lame' && "font-display-lame text-[#102A43]")}>Full Name</label>
              <span className={cn("text-xs opacity-50", passportData.name.length > 50 && "text-red-500 opacity-100")}>{passportData.name.length}/50</span>
            </div>
            <input type="text" name="name" value={passportData.name} onChange={handleInputChange} className={cn(
              "w-full p-4 outline-none transition-all",
              validationErrors.name && "border-red-500 bg-red-50",
              theme === 'neo' && "border-4 border-black font-mono",
              theme === 'cottagecore' && "rounded-xl border border-[#d2c5b3] bg-white",
              theme === 'lame' && "rounded-md border border-[#BCCCDC] bg-[#F0F4F8] font-display-lame focus:bg-white"
            )} />
            {validationErrors.name && (
              <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className={cn("block font-bold", theme === 'neo' && "font-display-neo uppercase text-xl", theme === 'cottagecore' && "font-serif text-[#2d4a22]", theme === 'lame' && "font-display-lame text-[#102A43]")}>Professional Title</label>
              <span className={cn("text-xs opacity-50", passportData.title.length > 100 && "text-red-500 opacity-100")}>{passportData.title.length}/100</span>
            </div>
            <input type="text" name="title" value={passportData.title} onChange={handleInputChange} className={cn(
              "w-full p-4 outline-none transition-all",
              validationErrors.title && "border-red-500 bg-red-50",
              theme === 'neo' && "border-4 border-black font-mono",
              theme === 'cottagecore' && "rounded-xl border border-[#d2c5b3] bg-white",
              theme === 'lame' && "rounded-md border border-[#BCCCDC] bg-[#F0F4F8] font-display-lame focus:bg-white"
            )} />
            {validationErrors.title && (
              <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className={cn("block font-bold", theme === 'neo' && "font-display-neo uppercase text-xl", theme === 'cottagecore' && "font-serif text-[#2d4a22]", theme === 'lame' && "font-display-lame text-[#102A43]")}>Location</label>
                <span className={cn("text-xs opacity-50", passportData.location.length > 100 && "text-red-500 opacity-100")}>{passportData.location.length}/100</span>
              </div>
              <input type="text" name="location" value={passportData.location} onChange={handleInputChange} className={cn(
                "w-full p-4 outline-none transition-all",
                validationErrors.location && "border-red-500 bg-red-50",
                theme === 'neo' && "border-4 border-black font-mono",
                theme === 'cottagecore' && "rounded-xl border border-[#d2c5b3] bg-white",
                theme === 'lame' && "rounded-md border border-[#BCCCDC] bg-[#F0F4F8] font-display-lame focus:bg-white"
              )} />
              {validationErrors.location && (
                <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.location}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className={cn("block font-bold", theme === 'neo' && "font-display-neo uppercase text-xl", theme === 'cottagecore' && "font-serif text-[#2d4a22]", theme === 'lame' && "font-display-lame text-[#102A43]")}>Experience</label>
                <span className={cn("text-xs opacity-50", passportData.experience.length > 50 && "text-red-500 opacity-100")}>{passportData.experience.length}/50</span>
              </div>
              <input type="text" name="experience" value={passportData.experience} onChange={handleInputChange} className={cn(
                "w-full p-4 outline-none transition-all",
                validationErrors.experience && "border-red-500 bg-red-50",
                theme === 'neo' && "border-4 border-black font-mono",
                theme === 'cottagecore' && "rounded-xl border border-[#d2c5b3] bg-white",
                theme === 'lame' && "rounded-md border border-[#BCCCDC] bg-[#F0F4F8] font-display-lame focus:bg-white"
              )} />
              {validationErrors.experience && (
                <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.experience}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className={cn("block font-bold", theme === 'neo' && "font-display-neo uppercase text-xl", theme === 'cottagecore' && "font-serif text-[#2d4a22]", theme === 'lame' && "font-display-lame text-[#102A43]")}>Bio</label>
              <span className={cn("text-xs opacity-50", passportData.bio.length > 500 && "text-red-500 opacity-100")}>{passportData.bio.length}/500</span>
            </div>
            <textarea rows={4} name="bio" value={passportData.bio} onChange={handleInputChange} className={cn(
              "w-full p-4 outline-none resize-none transition-all",
              validationErrors.bio && "border-red-500 bg-red-50",
              theme === 'neo' && "border-4 border-black font-mono",
              theme === 'cottagecore' && "rounded-xl border border-[#d2c5b3] bg-white",
              theme === 'lame' && "rounded-md border border-[#BCCCDC] bg-[#F0F4F8] font-display-lame focus:bg-white"
            )} />
            {validationErrors.bio && (
              <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.bio}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <label className={cn("block font-bold", theme === 'neo' && "font-display-neo uppercase text-xl", theme === 'cottagecore' && "font-serif text-[#2d4a22]", theme === 'lame' && "font-display-lame text-[#102A43]")}>
              Resume / CV
            </label>
            
            {!passportData.resume ? (
              <div className="space-y-3">
                <div 
                  onClick={() => resumeInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed p-6 text-center cursor-pointer transition-all",
                    resumeError && "border-red-500 bg-red-50",
                    !resumeError && theme === 'neo' && "border-black bg-white hover:bg-[#ff00ff] hover:text-white",
                    !resumeError && theme === 'cottagecore' && "border-[#d2c5b3] bg-[#fdfbf7] rounded-2xl hover:bg-[#f4ecd8]",
                    !resumeError && theme === 'lame' && "border-[#BCCCDC] bg-[#F0F4F8] rounded-md hover:bg-[#E4E7EB]"
                  )}
                >
                  <input 
                    type="file" 
                    ref={resumeInputRef}
                    onChange={handleResumeSelect}
                    accept=".pdf,.docx"
                    className="hidden" 
                  />
                  <FileText className={cn("w-6 h-6 mx-auto mb-2", resumeError ? "text-red-500" : theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#627D98]" : "text-[#8a9a5b]")} />
                  <p className={cn("text-sm", theme === 'neo' && "font-mono uppercase", theme === 'cottagecore' && "font-serif text-[#c86b5e]", theme === 'lame' && "font-display-lame text-[#486581]")}>
                    Upload PDF or DOCX
                  </p>
                </div>
                {resumeError && (
                  <div className={cn(
                    "flex items-center gap-2 text-sm font-bold",
                    theme === 'neo' ? "text-red-600 font-mono uppercase" : "text-red-500"
                  )}>
                    <AlertCircle className="w-4 h-4" />
                    {resumeError}
                  </div>
                )}
              </div>
            ) : (
              <div className={cn(
                "p-4 flex items-center justify-between",
                theme === 'neo' && "bg-black text-white border-4 border-black",
                theme === 'cottagecore' && "bg-[#f4ecd8] rounded-xl border border-[#d2c5b3]",
                theme === 'lame' && "bg-[#F0F4F8] rounded-md border border-[#BCCCDC]"
              )}>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium truncate max-w-[200px]">{passportData.resume.name}</span>
                </div>
                <button 
                  onClick={removeResume}
                  className={cn(
                    "p-1 hover:bg-black/10 rounded-full transition-colors",
                    theme === 'neo' && "hover:bg-white/20"
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className={cn("block font-bold", theme === 'neo' && "font-display-neo uppercase text-xl", theme === 'cottagecore' && "font-serif text-[#2d4a22]", theme === 'lame' && "font-display-lame text-[#102A43]")}>
              {theme === 'lame' ? "Upload Assets" : "Project Images"}
            </label>

            {/* Slots Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div className="flex gap-1.5">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "h-2.5 w-10 transition-all duration-500",
                      i < passportData.projects.length 
                        ? (
                            theme === 'neo' ? "bg-[#ccff00] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : 
                            theme === 'cottagecore' ? "bg-[#8a9a5b] rounded-full" : 
                            "bg-[#102A43] rounded-sm"
                          )
                        : (
                            theme === 'neo' ? "bg-white border-2 border-black/10" : 
                            theme === 'cottagecore' ? "bg-[#d2c5b3]/20 rounded-full" : 
                            "bg-[#D9E2EC] rounded-sm"
                          )
                    )}
                  />
                ))}
              </div>
              <p className={cn(
                "text-xs font-bold whitespace-nowrap",
                theme === 'neo' && "font-mono uppercase text-black",
                theme === 'cottagecore' && "font-serif text-[#c86b5e]",
                theme === 'lame' && "font-display-lame text-[#486581]"
              )}>
                {passportData.projects.length === 6 
                  ? "All slots filled!" 
                  : `${passportData.projects.length} of 6 slots filled. ${6 - passportData.projects.length} slots remaining.`}
              </p>
            </div>
            
            {/* Upload Area */}
            <div className="space-y-3">
              <div 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed p-8 text-center cursor-pointer transition-all relative",
                  isDragging && "scale-[0.98] border-solid",
                  imageError && "border-red-500 bg-red-50",
                  !imageError && theme === 'neo' && "border-black bg-white hover:bg-[#ccff00]",
                  !imageError && theme === 'cottagecore' && "border-[#d2c5b3] bg-[#fdfbf7] rounded-2xl hover:bg-[#f4ecd8]",
                  !imageError && theme === 'lame' && "border-[#BCCCDC] bg-[#F0F4F8] rounded-md hover:bg-[#E4E7EB]",
                  isDragging && theme === 'neo' && "bg-[#ccff00]",
                  isDragging && theme === 'cottagecore' && "bg-[#f4ecd8]",
                  isDragging && theme === 'lame' && "bg-[#E4E7EB]"
                )}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple 
                  accept="image/*"
                  className="hidden" 
                />
                <Upload className={cn("w-8 h-8 mx-auto mb-4", imageError ? "text-red-500" : theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#627D98]" : "text-[#8a9a5b]")} />
                <p className={cn(theme === 'neo' && "font-mono uppercase", theme === 'cottagecore' && "font-serif text-[#c86b5e]", theme === 'lame' && "font-display-lame text-[#486581]")}>
                  Drag & drop up to 6 images, or click to browse
                </p>
                <p className="text-xs mt-2 opacity-60">Max 5MB per image</p>
              </div>
              {imageError && (
                <div className={cn(
                  "flex items-center gap-2 text-sm font-bold",
                  theme === 'neo' ? "text-red-600 font-mono uppercase" : "text-red-500"
                )}>
                  <AlertCircle className="w-4 h-4" />
                  {imageError}
                </div>
              )}
            </div>

            {/* Previews */}
            {passportData.projects.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-4">
                {passportData.projects.map((project) => (
                  <div key={project.id} className="relative group aspect-square">
                    <img 
                      src={project.img} 
                      alt={project.title} 
                      className={cn(
                        "w-full h-full object-cover",
                        theme === 'neo' && "border-2 border-black",
                        theme === 'cottagecore' && "rounded-xl",
                        theme === 'lame' && "rounded"
                      )}
                      referrerPolicy="no-referrer"
                    />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeProject(project.id);
                      }}
                      className={cn(
                        "absolute -top-2 -right-2 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity",
                        theme === 'neo' && "bg-black text-white border-2 border-white",
                        theme === 'cottagecore' && "bg-[#c86b5e] text-white",
                        theme === 'lame' && "bg-[#102A43] text-white"
                      )}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={isPublishing}
            className={cn(
              "w-full py-6 text-2xl transition-all flex items-center justify-center gap-2 mt-8",
              isPublishing && "opacity-70 cursor-not-allowed",
              theme === 'neo' && "bg-[#ff00ff] text-white font-display-neo font-bold uppercase border-4 border-black hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
              theme === 'cottagecore' && "bg-[#2d4a22] text-[#fdfbf7] font-serif rounded-full hover:bg-[#1a2e13] shadow-md",
              theme === 'lame' && "bg-[#102A43] text-white font-display-lame font-bold rounded-md hover:bg-[#243B53] shadow-sm"
            )}
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Publishing...
              </>
            ) : (
              theme === 'lame' ? "Save Configuration" : "Publish Passport"
            )}
          </button>
        </form>
      </div>

      {/* Live Preview Section */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg">
        <div className="sticky top-28">
          <div className="flex items-center gap-2 mb-4">
            <Eye className={cn("w-5 h-5", theme === 'neo' ? "text-black" : theme === 'lame' ? "text-[#627D98]" : "text-[#8a9a5b]")} />
            <h3 className={cn("text-xl", theme === 'neo' && "font-display-neo uppercase", theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]", theme === 'lame' && "font-display-lame font-bold text-[#486581]")}>
              Live Preview
            </h3>
          </div>
          
          <div className={cn(
            "p-6 overflow-hidden",
            theme === 'neo' && "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
            theme === 'cottagecore' && "bg-[#fdfbf7] rounded-3xl border border-[#d2c5b3] shadow-sm",
            theme === 'lame' && "bg-white rounded-lg border border-[#D9E2EC] shadow-sm"
          )}>
            <div className="flex items-center gap-4 mb-6">
              <div className={cn(
                "w-20 h-20 flex-shrink-0 bg-gray-200 flex items-center justify-center overflow-hidden",
                theme === 'neo' && "border-4 border-black",
                theme === 'cottagecore' && "rounded-full border-2 border-[#d2c5b3]",
                theme === 'lame' && "rounded-md"
              )}>
                {passportData.avatarUrl ? (
                  <img src={passportData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h4 className={cn(
                  "text-2xl transition-all duration-500", 
                  theme === 'neo' && "font-display-neo uppercase", 
                  theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]", 
                  theme === 'lame' && "font-display-lame font-bold text-[#102A43]",
                  highlightedFields.includes('name') && (
                    theme === 'neo' ? "bg-[#ccff00] text-black px-2" :
                    theme === 'cottagecore' ? "bg-[#f4ecd8] px-2 rounded" :
                    "bg-[#00FFFF]/20 px-2 rounded"
                  )
                )}>
                  {passportData.name || 'Your Name'}
                </h4>
                <p className={cn(
                  "text-sm transition-all duration-500", 
                  theme === 'neo' && "font-mono", 
                  theme === 'cottagecore' && "font-serif text-[#c86b5e]", 
                  theme === 'lame' && "font-display-lame text-[#486581]",
                  highlightedFields.includes('title') && (
                    theme === 'neo' ? "bg-black text-[#ccff00] px-1" :
                    theme === 'cottagecore' ? "bg-[#f4ecd8] px-1 rounded" :
                    "bg-[#00FFFF]/20 px-1 rounded"
                  )
                )}>
                  {passportData.title || 'Your Title'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={cn(
                "text-xs px-2 py-1 transition-all duration-500", 
                theme === 'neo' && "bg-gray-100 border-2 border-black font-mono", 
                theme === 'cottagecore' && "bg-[#f4ecd8] text-[#8a9a5b] rounded-full font-serif", 
                theme === 'lame' && "bg-[#F0F4F8] text-[#627D98] rounded font-display-lame",
                highlightedFields.includes('location') && "ring-2 ring-offset-2 " + (
                  theme === 'neo' ? "ring-[#ccff00]" :
                  theme === 'cottagecore' ? "ring-[#8a9a5b]" :
                  "ring-[#00FFFF]"
                )
              )}>{passportData.location || 'Location'}</span>
              <span className={cn(
                "text-xs px-2 py-1 transition-all duration-500", 
                theme === 'neo' && "bg-gray-100 border-2 border-black font-mono", 
                theme === 'cottagecore' && "bg-[#f4ecd8] text-[#8a9a5b] rounded-full font-serif", 
                theme === 'lame' && "bg-[#F0F4F8] text-[#627D98] rounded font-display-lame",
                highlightedFields.includes('experience') && "ring-2 ring-offset-2 " + (
                  theme === 'neo' ? "ring-[#ccff00]" :
                  theme === 'cottagecore' ? "ring-[#8a9a5b]" :
                  "ring-[#00FFFF]"
                )
              )}>{passportData.experience || 'Experience'}</span>
            </div>
            
            <p className={cn(
              "text-sm mb-6 transition-all duration-500", 
              theme === 'neo' && "font-sans", 
              theme === 'cottagecore' && "text-gray-700", 
              theme === 'lame' && "font-display-lame text-[#486581]",
              highlightedFields.includes('bio') && (
                theme === 'neo' ? "border-l-4 border-[#ccff00] pl-2 bg-gray-50" :
                theme === 'cottagecore' ? "bg-[#f4ecd8]/50 p-2 rounded-lg" :
                "bg-[#00FFFF]/5 p-2 rounded"
              )
            )}>
              {passportData.bio || 'Your bio will appear here...'}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {passportData.projects.length > 0 ? (
                passportData.projects.slice(0, 4).map(project => (
                  <div key={project.id} className={cn(
                    "aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden",
                    theme === 'neo' && "border-2 border-black",
                    theme === 'cottagecore' && "rounded-xl",
                    theme === 'lame' && "rounded"
                  )}>
                    <img src={project.img} alt={project.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))
              ) : (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className={cn(
                    "aspect-[4/3] bg-gray-100 flex items-center justify-center",
                    theme === 'neo' && "border-2 border-black",
                    theme === 'cottagecore' && "rounded-xl",
                    theme === 'lame' && "rounded"
                  )}>
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
