"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isMini: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMini, setIsMini] = useState(false);

  // Optional: check localStorage for saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-mini");
    if (saved === "true") {
      setIsMini(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsMini((prev) => {
      const newVal = !prev;
      localStorage.setItem("sidebar-mini", String(newVal));
      return newVal;
    });
  };

  return (
    <SidebarContext.Provider value={{ isMini, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
