'use client';

import { createContext, useState, ReactNode } from 'react';

interface CampaignContextType {
  isFullMoon: boolean;
  setIsFullMoon: (isFull: boolean) => void;
  isSolo: boolean;
  setIsSolo: (isSolo: boolean) => void;
}

export const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [isFullMoon, setIsFullMoon] = useState(false);
  const [isSolo, setIsSolo] = useState(false);

  return (
    <CampaignContext.Provider value={{ isFullMoon, setIsFullMoon, isSolo, setIsSolo }}>
      {children}
    </CampaignContext.Provider>
  );
}
