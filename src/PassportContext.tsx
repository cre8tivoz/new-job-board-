import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Theme } from './types';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

export interface PassportData {
  name: string;
  title: string;
  location: string;
  experience: string;
  bio: string;
  avatarUrl: string;
  projects: { id: number; title: string; img: string }[];
  resume: { name: string; url: string } | null;
}

interface PassportContextType {
  passportData: PassportData;
  updatePassportData: (data: Partial<PassportData>) => void;
  user: User | null;
  isAuthReady: boolean;
}

const defaultPassportData: PassportData = {
  name: 'Alex Creative',
  title: 'Senior Digital Designer & Art Director',
  location: 'Melbourne, VIC',
  experience: '8+ Years Exp',
  bio: 'I specialize in creating bold, memorable digital experiences for lifestyle and tech brands. Passionate about typography, brutalist design, and accessible interfaces.',
  avatarUrl: 'https://picsum.photos/seed/avatar/200/200',
  projects: [
    { id: 1, title: "Brand Identity", img: "https://picsum.photos/seed/brand/600/400" },
    { id: 2, title: "Web Design", img: "https://picsum.photos/seed/web/600/400" },
    { id: 3, title: "Illustration", img: "https://picsum.photos/seed/illus/600/400" },
    { id: 4, title: "UI/UX", img: "https://picsum.photos/seed/ui/600/400" },
    { id: 5, title: "Packaging", img: "https://picsum.photos/seed/pack/600/400" },
    { id: 6, title: "Motion", img: "https://picsum.photos/seed/motion/600/400" },
  ],
  resume: null,
};

const PassportContext = createContext<PassportContextType | undefined>(undefined);

export function PassportProvider({ children }: { children: ReactNode }) {
  const [passportData, setPassportData] = useState<PassportData>(defaultPassportData);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isAuthReady) return;

    const docRef = doc(db, 'passports', user.uid);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setPassportData(snapshot.data() as PassportData);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `passports/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  const updatePassportData = async (data: Partial<PassportData>) => {
    const newData = { ...passportData, ...data };
    setPassportData(newData);

    if (user) {
      try {
        const docRef = doc(db, 'passports', user.uid);
        await setDoc(docRef, {
          ...newData,
          uid: user.uid,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `passports/${user.uid}`);
      }
    }
  };

  return (
    <PassportContext.Provider value={{ passportData, updatePassportData, user, isAuthReady }}>
      {children}
    </PassportContext.Provider>
  );
}

export function usePassport() {
  const context = useContext(PassportContext);
  if (context === undefined) {
    throw new Error('usePassport must be used within a PassportProvider');
  }
  return context;
}
