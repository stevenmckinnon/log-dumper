import { useLoggerContext } from '../LoggerProvider/LoggerProvider';

export const useLogger = () => {
  const logger = useLoggerContext();
  return {
    logAction: logger.logAction.bind(logger),
    logError: logger.logError.bind(logger),
    getLogs: logger.getLogs.bind(logger),
    clearLogs: logger.clearLogs.bind(logger),
    downloadLog: logger.downloadLog.bind(logger),
  };
};
