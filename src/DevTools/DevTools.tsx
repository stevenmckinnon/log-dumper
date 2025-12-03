import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLoggerContext } from '../LogDumper/LogDumper';
import { LogEntry, LogLevel } from '../logger';
import { injectStyles } from './styles';

export interface LogDevToolsProps {
  /** Initial position of the panel */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Initial collapsed state when visible */
  defaultCollapsed?: boolean;
  /** 
   * Whether the DevTools panel is visible by default.
   * Use keyboard shortcut to toggle visibility.
   * @default false
   */
  defaultVisible?: boolean;
  /** Maximum height of the log panel */
  maxHeight?: number;
  /** Custom class name for the container */
  className?: string;
  /** Custom styles for the container */
  style?: React.CSSProperties;
  /** Theme variant */
  theme?: 'dark' | 'light';
  /** 
   * Keyboard shortcut to toggle visibility of the DevTools.
   * Set to false to disable keyboard shortcut.
   * @default { key: 'd', metaKey: true, shiftKey: true } (Cmd/Ctrl+Shift+D)
   */
  keyboardShortcut?: { key: string; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } | false;
}

const positionStyles: Record<string, React.CSSProperties> = {
  'bottom-right': { bottom: 16, right: 16 },
  'bottom-left': { bottom: 16, left: 16 },
  'top-right': { top: 16, right: 16 },
  'top-left': { top: 16, left: 16 },
};

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const timeStr = date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${timeStr}.${ms}`;
};

// Icons as simple SVG components for better visual polish
const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ld-entry-chevron ${expanded ? 'ld-entry-chevron--expanded' : ''}`}
    style={{
      transition: 'transform 0.2s ease',
      transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
    }}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </svg>
);

const TerminalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" x2="20" y1="19" y2="19" />
  </svg>
);

interface LogEntryRowProps {
  entry: LogEntry;
  isExpanded: boolean;
  onToggle: () => void;
}

const LogEntryRow = ({ entry, isExpanded, onToggle }: LogEntryRowProps) => {
  const hasDetails = entry.context || entry.errorStack || entry.metadata;

  const detailsContent = isExpanded && hasDetails && (
    <div className="ld-details">
      {entry.context && (
        <div className="ld-details-section">
          <div className="ld-details-label">
            <span>Context</span>
          </div>
          <pre className="ld-details-pre">
            {JSON.stringify(entry.context, null, 2)}
          </pre>
        </div>
      )}
      {entry.metadata && (
        <div className="ld-details-section">
          <div className="ld-details-label">
            <span>Metadata</span>
          </div>
          <pre className="ld-details-pre">
            {JSON.stringify(entry.metadata, null, 2)}
          </pre>
        </div>
      )}
      {entry.errorStack && (
        <div className="ld-details-section">
          <div className="ld-details-label">
            <span>Stack Trace</span>
          </div>
          <pre className="ld-details-pre ld-details-pre--stack">
            {entry.errorStack}
          </pre>
        </div>
      )}
    </div>
  );

  // Animate details expand/collapse
  const animatedDetails = (
    <AnimatePresence>
      {isExpanded && hasDetails && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ overflow: 'hidden' }}
        >
          {detailsContent}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`ld-entry ld-entry--${entry.level}`}>
      <div
        onClick={hasDetails ? onToggle : undefined}
        className={`ld-entry-row ${!hasDetails ? 'ld-entry-row--no-details' : ''}`}
      >
        <span className="ld-entry-time">{formatTime(entry.timestamp)}</span>
        <span className={`ld-badge ld-badge--${entry.level}`}>{entry.level}</span>
        {entry.loggerName && (
          <span className="ld-badge ld-badge--logger">{entry.loggerName}</span>
        )}
        <span className="ld-entry-message">{entry.message}</span>
        {hasDetails && <ChevronIcon expanded={isExpanded} />}
      </div>
      {animatedDetails}
    </div>
  );
};

const defaultKeyboardShortcut = { key: 'd', metaKey: true, shiftKey: true };

export const LogDevTools = ({
  position = 'bottom-right',
  defaultCollapsed = true,
  defaultVisible = false,
  maxHeight = 400,
  className = '',
  style,
  keyboardShortcut = defaultKeyboardShortcut,
}: LogDevToolsProps) => {
  const logger = useLoggerContext();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(defaultVisible);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Inject styles on mount
  useEffect(() => {
    injectStyles();
  }, []);

  // Keyboard shortcut to toggle visibility
  useEffect(() => {
    if (keyboardShortcut === false) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcut = keyboardShortcut;
      
      // Check if the pressed key matches the shortcut
      const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
      // metaKey is cross-platform: Cmd on Mac, Ctrl on Windows
      const metaMatches = shortcut.metaKey === undefined 
        ? true 
        : shortcut.metaKey 
          ? (e.metaKey || e.ctrlKey) 
          : (!e.metaKey && !e.ctrlKey);
      const ctrlMatches = shortcut.ctrlKey === undefined ? true : shortcut.ctrlKey === e.ctrlKey;
      const shiftMatches = shortcut.shiftKey === undefined ? true : shortcut.shiftKey === e.shiftKey;
      const altMatches = shortcut.altKey === undefined ? true : shortcut.altKey === e.altKey;

      if (keyMatches && metaMatches && ctrlMatches && shiftMatches && altMatches) {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardShortcut]);

  // Subscribe to new logs
  useEffect(() => {
    setLogs(logger.getLogs());
    const unsubscribe = logger.subscribe((entry) => {
      setLogs((prev) => [...prev, entry]);
    });
    return unsubscribe;
  }, [logger]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (!isCollapsed && isVisible && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isCollapsed, isVisible]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filter !== 'all' && log.level !== filter) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          log.message.toLowerCase().includes(searchLower) ||
          (log.context && JSON.stringify(log.context).toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [logs, filter, search]);

  const handleClear = useCallback(() => {
    logger.clearLogs();
    setLogs([]);
    setExpandedIds(new Set());
  }, [logger]);

  const handleDownload = useCallback(() => {
    logger.downloadLog();
  }, [logger]);

  const errorCount = useMemo(() => logs.filter((l) => l.level === 'error').length, [logs]);
  const warnCount = useMemo(() => logs.filter((l) => l.level === 'warn').length, [logs]);

  // Don't render anything if not visible (after ALL hooks)
  if (!isVisible) {
    return null;
  }

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 99999,
    ...positionStyles[position],
    ...style,
  };

  // Get transform origin based on position for expand animation
  const getTransformOrigin = () => {
    switch (position) {
      case 'bottom-right': return 'bottom right';
      case 'bottom-left': return 'bottom left';
      case 'top-right': return 'top right';
      case 'top-left': return 'top left';
      default: return 'bottom right';
    }
  };

  const triggerContent = (
    <>
      <TerminalIcon />
      <span>Logs</span>
      <span className="ld-trigger-count">{logs.length}</span>
      {errorCount > 0 && (
        <span className="ld-trigger-badge ld-trigger-badge--error">{errorCount}</span>
      )}
      {warnCount > 0 && (
        <span className="ld-trigger-badge ld-trigger-badge--warn">{warnCount}</span>
      )}
    </>
  );

  const panelContent = (
    <>
      {/* Header */}
      <div className="ld-header">
        <div className="ld-header-title">
          <TerminalIcon />
          <span className="ld-header-text">LogDumper</span>
          <span className="ld-header-count">{filteredLogs.length}</span>
        </div>
        <div className="ld-header-actions">
          <button
            onClick={handleDownload}
            className="ld-btn"
            title="Download logs as JSON"
          >
            <DownloadIcon />
          </button>
          <button
            onClick={handleClear}
            className="ld-btn ld-btn--danger"
            title="Clear all logs"
          >
            <TrashIcon />
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="ld-btn"
            title="Collapse panel"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="ld-toolbar">
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ld-search"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as LogLevel | 'all')}
          className="ld-select"
        >
          <option value="all">All levels</option>
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Logs */}
      <div className="ld-logs" style={{ maxHeight }}>
        {filteredLogs.length === 0 ? (
          <div className="ld-empty">
            <div className="ld-empty-icon">📋</div>
            <div className="ld-empty-text">
              {logs.length === 0 ? 'No logs yet' : 'No logs match your filters'}
            </div>
          </div>
        ) : (
          filteredLogs.map((entry) => (
            <LogEntryRow
              key={entry.id}
              entry={entry}
              isExpanded={expandedIds.has(entry.id)}
              onToggle={() => toggleExpanded(entry.id)}
            />
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </>
  );

  const transformOrigin = getTransformOrigin();

  return (
    <div className={`ld-devtools ${className}`} style={containerStyle}>
      <AnimatePresence mode="wait" initial={false}>
        {isCollapsed ? (
          <motion.button
            key="trigger"
            className="ld-trigger"
            onClick={() => setIsCollapsed(false)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: 0.15,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              transformOrigin,
            }}
          >
            {triggerContent}
          </motion.button>
        ) : (
          <motion.div
            key="panel"
            className="ld-panel"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ 
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{ transformOrigin }}
          >
            {panelContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
