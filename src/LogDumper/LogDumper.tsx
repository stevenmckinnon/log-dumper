import { createContext, useRef, useContext, ReactNode } from "react";
import { Logger, LoggerOptions } from "../logger";

const LoggerContext = createContext<Logger | null>(null);

export interface LogDumperProps extends LoggerOptions {
  children: ReactNode;
}

export const LogDumper = ({ children, ...loggerOptions }: LogDumperProps) => {
  const loggerRef = useRef<Logger>(new Logger(loggerOptions));
  return (
    <LoggerContext.Provider value={loggerRef.current}>
      {children}
    </LoggerContext.Provider>
  );
};

export const useLoggerContext = () => {
  const ctx = useContext(LoggerContext);
  if (!ctx)
    throw new Error("useLoggerContext must be used within a LogDumper");
  return ctx;
};
