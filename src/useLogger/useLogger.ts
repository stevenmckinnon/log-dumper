import { useMemo } from 'react';
import { useLoggerContext, useNamedLoggersContext, getOrCreateNamedLogger } from '../LogDumper/LogDumper';
import { Logger, LogLevel, LogEntry, LoggerOptions, LogSubscriber } from '../logger';

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
  // Always call both hooks unconditionally to satisfy Rules of Hooks
  const defaultLogger = useLoggerContext();
  const namedLoggers = useNamedLoggersContext();

  // Determine which logger to use, cast once to the caller's TContext.
  // The context stores Logger<Record<string,unknown>>; the cast is safe because
  // TContext is constrained to be used only at call sites via UseLoggerReturn<TContext>.
  const logger = useMemo<Logger<TContext>>(() => {
    const raw = name
      ? getOrCreateNamedLogger(name, options, namedLoggers, defaultLogger)
      : defaultLogger;
    return raw as unknown as Logger<TContext>;
  }, [name, defaultLogger, namedLoggers, options]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    logAction: (message: string, context?: TContext, componentName?: string) =>
      logger.logAction(message, context, componentName),
    logError: (error: Error, context?: TContext, componentName?: string) =>
      logger.logError(error, context, componentName),
    logDebug: (message: string, context?: TContext, componentName?: string) =>
      logger.logDebug(message, context, componentName),
    logInfo: (message: string, context?: TContext, componentName?: string) =>
      logger.logInfo(message, context, componentName),
    logWarn: (message: string, context?: TContext, componentName?: string) =>
      logger.logWarn(message, context, componentName),
    getLogs: (filter) => logger.getLogs(filter),
    clearLogs: () => logger.clearLogs(),
    downloadLog: (filename?: string) => logger.downloadLog(filename),
    subscribe: (subscriber: LogSubscriber<TContext>) => logger.subscribe(subscriber),
  }), [logger]);
};
