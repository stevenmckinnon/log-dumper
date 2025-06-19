import React, { createContext, useRef, useContext, ReactNode } from "react";
import { Logger } from "../logger";

const LoggerContext = createContext<Logger | null>(null);

export const LogDumper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const loggerRef = useRef<Logger>(new Logger());
  return (
    <LoggerContext.Provider value={loggerRef.current}>
      {children}
    </LoggerContext.Provider>
  );
};

export const useLoggerContext = () => {
  const ctx = useContext(LoggerContext);
  if (!ctx)
    throw new Error("useLoggerContext must be used within a LoggerProvider");
  return ctx;
};
