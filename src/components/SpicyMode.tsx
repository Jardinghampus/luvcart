"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "bb-spicy-mode";

type SpicyContextValue = {
  spicy: boolean;
  setSpicy: (value: boolean) => void;
  toggleSpicy: () => void;
};

const SpicyContext = createContext<SpicyContextValue | null>(null);

export function SpicyProvider({ children }: { children: ReactNode }) {
  const [spicy, setSpicyState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setSpicyState(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("is-spicy", spicy);
    try {
      localStorage.setItem(STORAGE_KEY, spicy ? "1" : "0");
    } catch {
      // ignore
    }
  }, [spicy, ready]);

  const setSpicy = useCallback((value: boolean) => {
    setSpicyState(value);
  }, []);

  const toggleSpicy = useCallback(() => {
    setSpicyState((v) => !v);
  }, []);

  const value = useMemo(
    () => ({ spicy, setSpicy, toggleSpicy }),
    [spicy, setSpicy, toggleSpicy]
  );

  return <SpicyContext.Provider value={value}>{children}</SpicyContext.Provider>;
}

export function useSpicy() {
  const ctx = useContext(SpicyContext);
  if (!ctx) {
    throw new Error("useSpicy must be used within SpicyProvider");
  }
  return ctx;
}
