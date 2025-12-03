import { createContext, useRef, useContext, ReactNode, ErrorInfo } from 'react';
import { Logger, LoggerOptions } from '../logger';
import { LoggerErrorBoundary } from '../ErrorBoundary';

// Context for the default logger
const LoggerContext = createContext<Logger | null>(null);

// Context for named loggers registry
const NamedLoggersContext = createContext<Map<string, Logger> | null>(null);

export interface LogDumperProps extends LoggerOptions {
  children: ReactNode;
  /** Wrap children in an error boundary that auto-logs errors */
  captureErrors?: boolean;
  /** Custom fallback UI for error boundary */
  errorFallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Callback when an error is caught by the error boundary */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export const LogDumper = ({
  children,
  captureErrors = false,
  errorFallback,
  onError,
  ...loggerOptions
}: LogDumperProps) => {
  const loggerRef = useRef<Logger>(new Logger(loggerOptions));
  const namedLoggersRef = useRef<Map<string, Logger>>(new Map());

  const content = captureErrors ? (
    <LoggerErrorBoundary
      logger={loggerRef.current}
      fallback={errorFallback}
      onError={onError}
    >
      {children}
    </LoggerErrorBoundary>
  ) : (
    children
  );

  return (
    <LoggerContext.Provider value={loggerRef.current}>
      <NamedLoggersContext.Provider value={namedLoggersRef.current}>
        {content}
      </NamedLoggersContext.Provider>
    </LoggerContext.Provider>
  );
};

export const useLoggerContext = () => {
  const ctx = useContext(LoggerContext);
  if (!ctx) throw new Error('useLoggerContext must be used within a LogDumper');
  return ctx;
};

export const useNamedLoggersContext = () => {
  const ctx = useContext(NamedLoggersContext);
  if (!ctx) throw new Error('useNamedLoggersContext must be used within a LogDumper');
  return ctx;
};

/**
 * Get or create a named logger instance
 * Named loggers share the same registry but have separate log streams
 */
export const useNamedLogger = (name: string, options?: Omit<LoggerOptions, 'name'>) => {
  const namedLoggers = useNamedLoggersContext();
  const defaultLogger = useLoggerContext();
  
  if (!namedLoggers.has(name)) {
    // Inherit options from default logger but allow overrides
    namedLoggers.set(
      name,
      new Logger({
        ...options,
        name,
        // If not specified, inherit forwardToConsole from default logger context
        forwardToConsole: options?.forwardToConsole,
      })
    );
  }
  
  return namedLoggers.get(name)!;
};
