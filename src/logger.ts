type LogEntry = {
  type: 'action' | 'error';
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  errorStack?: string;
};

export class Logger {
  private logs: LogEntry[] = [];

  logAction(message: string, context?: Record<string, any>) {
    this.logs.push({
      type: 'action',
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  logError(error: Error, context?: Record<string, any>) {
    this.logs.push({
      type: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
      context,
      errorStack: error.stack,
    });
  }

  getLogs() {
    return [...this.logs];
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
}
