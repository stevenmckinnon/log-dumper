import { describe, it, expect, beforeEach } from 'vitest';
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
    expect(logs[0].message).toBe('Clicked button');
    expect(logs[0].context).toEqual({ button: 'submit' });
  });

  it('logs errors', () => {
    const error = new Error('Something went wrong');
    logger.logError(error, { page: 'dashboard' });
    const logs = logger.getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].type).toBe('error');
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
