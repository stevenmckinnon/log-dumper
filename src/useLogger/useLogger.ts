import { useCallback, useMemo } from 'react';
import { useLoggerContext, useNamedLogger } from '../LogDumper/LogDumper';
import { LogLevel, LogEntry, LoggerOptions, LogSubscriber } from '../logger';

export interface UseLoggerReturn<TContext = Record<string, unknown>> {
  /** Log an action (alias for logInfo, kept for backwards compatibility) */
  logAction: (message: string, context?: TContext, componentName?: string) => void;
  /** Log an error */
  logError: (error: Error, context?: TContext, componentName?: string) => void;
  /** Log a debug message */
  logDebug: (message: string, context?: TContext, componentName?: string) => void;
  /** Log an info message */
  logInfo: (message: string, context?: TContext, componentName?: string) => void;
  /** Log a warning message */
  logWarn: (message: string, context?: TContext, componentName?: string) => void;
  /** Get all logs, optionally filtered */
  getLogs: (filter?: {
    level?: LogLevel;
    type?: 'action' | 'error';
    since?: Date;
    search?: string;
  }) => LogEntry<TContext>[];
  /** Clear all logs */
  clearLogs: () => void;
  /** Download logs as JSON file */
  downloadLog: (filename?: string) => void;
  /** Subscribe to new log entries (returns unsubscribe function) */
  subscribe: (subscriber: LogSubscriber<TContext>) => () => void;
}

/**
 * Hook to access the logger
 * @param name - Optional logger name for named logger instances
 * @param options - Optional configuration for named loggers
 * 
 * @example
 * // Default logger
 * const { logAction, logError } = useLogger();
 * 
 * @example
 * // With typed context
 * interface MyContext { userId: string; page: string; }
 * const { logAction } = useLogger<MyContext>();
 * logAction('clicked', { userId: '123', page: 'home' }); // Type-checked!
 * 
 * @example
 * // Named logger
 * const { logAction } = useLogger('auth');
 * logAction('User logged in', { userId: '123' });
 */
export const useLogger = <TContext = Record<string, unknown>>(
  name?: string,
  options?: Omit<LoggerOptions, 'name'>
): UseLoggerReturn<TContext> => {
  // Get the appropriate logger based on whether a name is provided
  const defaultLogger = useLoggerContext();
  
  // For named loggers, we need to call the hook conditionally which isn't ideal
  // But since this is a hook composition, we'll handle it differently
  const logger = name 
    ? useNamedLogger(name, options)
    : defaultLogger;

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    logAction: (message: string, context?: TContext, componentName?: string) => {
      logger.logAction(message, context as Record<string, unknown>, componentName);
    },
    logError: (error: Error, context?: TContext, componentName?: string) => {
      logger.logError(error, context as Record<string, unknown>, componentName);
    },
    logDebug: (message: string, context?: TContext, componentName?: string) => {
      logger.logDebug(message, context as Record<string, unknown>, componentName);
    },
    logInfo: (message: string, context?: TContext, componentName?: string) => {
      logger.logInfo(message, context as Record<string, unknown>, componentName);
    },
    logWarn: (message: string, context?: TContext, componentName?: string) => {
      logger.logWarn(message, context as Record<string, unknown>, componentName);
    },
    getLogs: (filter) => logger.getLogs(filter) as LogEntry<TContext>[],
    clearLogs: () => logger.clearLogs(),
    downloadLog: (filename?: string) => logger.downloadLog(filename),
    subscribe: (subscriber: LogSubscriber<TContext>) => 
      logger.subscribe(subscriber as LogSubscriber<Record<string, unknown>>),
  }), [logger]);
};
