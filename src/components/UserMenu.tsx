import React from 'react';
import { Link } from 'react-router-dom';
import { usePassport } from '../PassportContext';
import { logout } from '../firebase';
import { cn } from '../lib/utils';
import { Theme } from '../types';
import { LogIn, LogOut, User as UserIcon, Loader2 } from 'lucide-react';

interface UserMenuProps {
  theme: Theme;
}

export function UserMenu({ theme }: UserMenuProps) {
  const { user, isAuthReady } = usePassport();

  if (!isAuthReady) {
    return (
      <div className="p-2">
        <Loader2 className="w-5 h-5 animate-spin opacity-50" />
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className={cn(
          "flex items-center gap-2 px-4 py-2 transition-all",
          theme === 'neo' && "bg-black text-white font-display-neo uppercase border-2 border-black hover:bg-white hover:text-black",
          theme === 'cottagecore' && "bg-[#f4ecd8] text-[#2d4a22] rounded-full font-serif border border-[#d2c5b3] hover:bg-[#e8dfc8]",
          theme === 'lame' && "bg-[#102A43] text-white rounded-md font-display-lame hover:bg-[#243B53]"
        )}
      >
        <LogIn className="w-4 h-4" />
        <span>Login</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || 'User'} 
            className={cn(
              "w-8 h-8 object-cover",
              theme === 'neo' && "border-2 border-black",
              theme === 'cottagecore' && "rounded-full border border-[#d2c5b3]",
              theme === 'lame' && "rounded-md"
            )}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={cn(
            "w-8 h-8 flex items-center justify-center",
            theme === 'neo' && "bg-black text-white border-2 border-black",
            theme === 'cottagecore' && "bg-[#f4ecd8] rounded-full border border-[#d2c5b3]",
            theme === 'lame' && "bg-[#102A43] text-white rounded-md"
          )}>
            <UserIcon className="w-4 h-4" />
          </div>
        )}
        <span className={cn(
          "hidden md:inline text-sm font-bold",
          theme === 'neo' && "font-display-neo uppercase",
          theme === 'cottagecore' && "font-serif text-[#2d4a22]",
          theme === 'lame' && "font-display-lame text-white"
        )}>
          {user.displayName?.split(' ')[0]}
        </span>
      </div>
      <button
        onClick={() => logout()}
        className={cn(
          "p-2 transition-all",
          theme === 'neo' && "bg-white text-black border-2 border-black hover:bg-black hover:text-white",
          theme === 'cottagecore' && "text-[#c86b5e] hover:bg-[#f4ecd8] rounded-full",
          theme === 'lame' && "text-gray-400 hover:text-[#00FFFF]"
        )}
        title="Logout"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
