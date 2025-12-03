import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger } from '../src/logger';

describe('Logger', () => {
  let logger: Logger;
  beforeEach(() => {
    logger = new Logger();
  });

  it('logs actions', () => {
    logger.logAction('Clicked button', { button: 'submit' });
    const logs = logger.getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].type).toBe('action');
    expect(logs[0].level).toBe('info'); // logAction uses 'info' level
    expect(logs[0].message).toBe('Clicked button');
    expect(logs[0].context).toEqual({ button: 'submit' });
  });

  it('logs errors', () => {
    const error = new Error('Something went wrong');
    logger.logError(error, { page: 'dashboard' });
    const logs = logger.getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].type).toBe('error');
    expect(logs[0].level).toBe('error');
    expect(logs[0].message).toBe('Something went wrong');
    expect(logs[0].context).toEqual({ page: 'dashboard' });
    expect(logs[0].errorStack).toBeDefined();
  });

  it('clears logs', () => {
    logger.logAction('A');
    logger.clearLogs();
    expect(logger.getLogs().length).toBe(0);
  });

  it('respects maxLogs option', () => {
    const logger = new Logger({ maxLogs: 3 });
    logger.logAction('A');
    logger.logAction('B');
    logger.logAction('C');
    logger.logAction('D');
    const logs = logger.getLogs();
    expect(logs.length).toBe(3);
    expect(logs[0].message).toBe('B');
    expect(logs[1].message).toBe('C');
    expect(logs[2].message).toBe('D');
  });
});

describe('Logger - Log Levels', () => {
  let logger: Logger;
  beforeEach(() => {
    logger = new Logger();
  });

  it('logs debug messages', () => {
    logger.logDebug('Debug message', { key: 'value' });
    const logs = logger.getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].level).toBe('debug');
    expect(logs[0].type).toBe('action');
    expect(logs[0].message).toBe('Debug message');
  });

  it('logs info messages', () => {
    logger.logInfo('Info message');
    const logs = logger.getLogs();
    expect(logs[0].level).toBe('info');
    expect(logs[0].type).toBe('action');
  });

  it('logs warning messages', () => {
    logger.logWarn('Warning message');
    const logs = logger.getLogs();
    expect(logs[0].level).toBe('warn');
    expect(logs[0].type).toBe('action');
  });

  it('can filter logs by level', () => {
    logger.logDebug('Debug');
    logger.logInfo('Info');
    logger.logWarn('Warn');
    logger.logError(new Error('Error'));

    expect(logger.getLogs({ level: 'debug' }).length).toBe(1);
    expect(logger.getLogs({ level: 'info' }).length).toBe(1);
    expect(logger.getLogs({ level: 'warn' }).length).toBe(1);
    expect(logger.getLogs({ level: 'error' }).length).toBe(1);
  });

  it('can filter logs by type', () => {
    logger.logAction('Action 1');
    logger.logAction('Action 2');
    logger.logError(new Error('Error'));

    expect(logger.getLogs({ type: 'action' }).length).toBe(2);
    expect(logger.getLogs({ type: 'error' }).length).toBe(1);
  });

  it('can filter logs by search term', () => {
    logger.logAction('User clicked button');
    logger.logAction('Page loaded');
    logger.logAction('User submitted form');

    const results = logger.getLogs({ search: 'user' });
    expect(results.length).toBe(2);
  });
});

describe('Logger - Subscriptions', () => {
  let logger: Logger;
  beforeEach(() => {
    logger = new Logger();
  });

  it('notifies subscribers of new logs', () => {
    const subscriber = vi.fn();
    logger.subscribe(subscriber);

    logger.logAction('Test message');

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber.mock.calls[0][0].message).toBe('Test message');
  });

  it('can unsubscribe', () => {
    const subscriber = vi.fn();
    const unsubscribe = logger.subscribe(subscriber);

    logger.logAction('Before unsubscribe');
    unsubscribe();
    logger.logAction('After unsubscribe');

    expect(subscriber).toHaveBeenCalledTimes(1);
  });

  it('handles subscriber errors gracefully', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const badSubscriber = vi.fn(() => {
      throw new Error('Subscriber error');
    });
    const goodSubscriber = vi.fn();

    logger.subscribe(badSubscriber);
    logger.subscribe(goodSubscriber);

    logger.logAction('Test');

    expect(badSubscriber).toHaveBeenCalled();
    expect(goodSubscriber).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});

describe('Logger - Console Forwarding', () => {
  it('forwards logs to console when enabled', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const logger = new Logger({ forwardToConsole: true });

    logger.logDebug('Debug');
    logger.logInfo('Info');
    logger.logWarn('Warn');
    logger.logError(new Error('Error'));

    expect(debugSpy).toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1); // Only error log (not the subscriber error)

    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    debugSpy.mockRestore();
  });

  it('does not forward to console when disabled', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = new Logger({ forwardToConsole: false });

    logger.logInfo('Test');

    expect(infoSpy).not.toHaveBeenCalled();
    infoSpy.mockRestore();
  });
});

describe('Logger - Named Loggers', () => {
  it('stores logger name', () => {
    const logger = new Logger({ name: 'auth' });
    logger.logAction('Test');

    const logs = logger.getLogs();
    expect(logs[0].loggerName).toBe('auth');
  });

  it('getName returns the logger name', () => {
    const logger = new Logger({ name: 'test-logger' });
    expect(logger.getName()).toBe('test-logger');
  });

  it('getName returns undefined for unnamed logger', () => {
    const logger = new Logger();
    expect(logger.getName()).toBeUndefined();
  });
});

describe('Logger - Log Entry IDs', () => {
  it('assigns unique IDs to each log entry', () => {
    const logger = new Logger();
    logger.logAction('A');
    logger.logAction('B');

    const logs = logger.getLogs();
    expect(logs[0].id).toBeDefined();
    expect(logs[1].id).toBeDefined();
    expect(logs[0].id).not.toBe(logs[1].id);
  });
});
