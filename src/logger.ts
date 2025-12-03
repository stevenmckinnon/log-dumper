export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogEntry<TContext = Record<string, unknown>> = {
  id: string;
  level: LogLevel;
  type: 'action' | 'error';
  message: string;
  timestamp: string;
  context?: TContext;
  errorStack?: string;
  metadata?: LogMetadata;
  loggerName?: string;
};

export interface LogMetadata {
  url?: string;
  sessionId?: string;
  userAgent?: string;
  componentName?: string;
}

export interface LoggerOptions {
  maxLogs?: number;
  forwardToConsole?: boolean;
  captureMetadata?: boolean;
  name?: string;
}

export type LogSubscriber<TContext = Record<string, unknown>> = (entry: LogEntry<TContext>) => void;

// Generate a unique session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Generate a unique log entry ID
const generateLogId = (): string => {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Singleton session ID for the current browser session
let currentSessionId: string | null = null;
const getSessionId = (): string => {
  if (!currentSessionId) {
    // Try to restore from sessionStorage if available
    if (typeof sessionStorage !== 'undefined') {
      currentSessionId = sessionStorage.getItem('__log_dumper_session_id__');
      if (!currentSessionId) {
        currentSessionId = generateSessionId();
        sessionStorage.setItem('__log_dumper_session_id__', currentSessionId);
      }
    } else {
      currentSessionId = generateSessionId();
    }
  }
  return currentSessionId;
};

export class Logger<TContext = Record<string, unknown>> {
  private logs: LogEntry<TContext>[] = [];
  private maxLogs?: number;
  private forwardToConsole: boolean;
  private captureMetadata: boolean;
  private name?: string;
  private subscribers: Set<LogSubscriber<TContext>> = new Set();

  constructor(options?: LoggerOptions) {
    this.maxLogs = options?.maxLogs;
    this.forwardToConsole = options?.forwardToConsole ?? false;
    this.captureMetadata = options?.captureMetadata ?? true;
    this.name = options?.name;
  }

  private trimLogs() {
    if (this.maxLogs && this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private getMetadata(): LogMetadata | undefined {
    if (!this.captureMetadata) return undefined;
    
    if (typeof window === 'undefined') return undefined;

    return {
      url: window.location?.href,
      sessionId: getSessionId(),
      userAgent: navigator?.userAgent,
    };
  }

  private notifySubscribers(entry: LogEntry<TContext>) {
    this.subscribers.forEach((subscriber) => {
      try {
        subscriber(entry);
      } catch (e) {
        console.error('Log subscriber error:', e);
      }
    });
  }

  private forwardToConsoleIfEnabled(entry: LogEntry<TContext>) {
    if (!this.forwardToConsole) return;

    const prefix = this.name ? `[${this.name}]` : '[LogDumper]';
    const args = [
      `${prefix} ${entry.message}`,
      entry.context ? { context: entry.context } : undefined,
      entry.metadata ? { metadata: entry.metadata } : undefined,
    ].filter(Boolean);

    switch (entry.level) {
      case 'debug':
        console.debug(...args);
        break;
      case 'info':
        console.info(...args);
        break;
      case 'warn':
        console.warn(...args);
        break;
      case 'error':
        console.error(...args);
        break;
    }
  }

  private createEntry(
    level: LogLevel,
    type: 'action' | 'error',
    message: string,
    context?: TContext,
    errorStack?: string,
    componentName?: string
  ): LogEntry<TContext> {
    const metadata = this.getMetadata();
    if (metadata && componentName) {
      metadata.componentName = componentName;
    }

    return {
      id: generateLogId(),
      level,
      type,
      message,
      timestamp: new Date().toISOString(),
      context,
      errorStack,
      metadata,
      loggerName: this.name,
    };
  }

  private addEntry(entry: LogEntry<TContext>) {
    this.logs.push(entry);
    this.trimLogs();
    this.forwardToConsoleIfEnabled(entry);
    this.notifySubscribers(entry);
  }

  // Log level methods
  logDebug(message: string, context?: TContext, componentName?: string) {
    const entry = this.createEntry('debug', 'action', message, context, undefined, componentName);
    this.addEntry(entry);
  }

  logInfo(message: string, context?: TContext, componentName?: string) {
    const entry = this.createEntry('info', 'action', message, context, undefined, componentName);
    this.addEntry(entry);
  }

  logWarn(message: string, context?: TContext, componentName?: string) {
    const entry = this.createEntry('warn', 'action', message, context, undefined, componentName);
    this.addEntry(entry);
  }

  // Original methods (kept for backwards compatibility)
  logAction(message: string, context?: TContext, componentName?: string) {
    const entry = this.createEntry('info', 'action', message, context, undefined, componentName);
    this.addEntry(entry);
  }

  logError(error: Error, context?: TContext, componentName?: string) {
    const entry = this.createEntry('error', 'error', error.message, context, error.stack, componentName);
    this.addEntry(entry);
  }

  // Subscription for real-time updates (used by DevTools)
  subscribe(subscriber: LogSubscriber<TContext>): () => void {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  getLogs(filter?: {
    level?: LogLevel;
    type?: 'action' | 'error';
    since?: Date;
    search?: string;
  }): LogEntry<TContext>[] {
    let result = [...this.logs];

    if (filter?.level) {
      result = result.filter((log) => log.level === filter.level);
    }
    if (filter?.type) {
      result = result.filter((log) => log.type === filter.type);
    }
    if (filter?.since) {
      const sinceTime = filter.since.getTime();
      result = result.filter((log) => new Date(log.timestamp).getTime() >= sinceTime);
    }
    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(
        (log) =>
          log.message.toLowerCase().includes(searchLower) ||
          (log.context && JSON.stringify(log.context).toLowerCase().includes(searchLower))
      );
    }

    return result;
  }

  clearLogs() {
    this.logs = [];
  }

  downloadLog(filename = 'log-dump.json') {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  getName(): string | undefined {
    return this.name;
  }
}
