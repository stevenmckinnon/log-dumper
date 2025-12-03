import { useState, useEffect, useRef, useCallback } from "react";
import { useLoggerContext } from "../LogDumper/LogDumper";
import { LogEntry, LogLevel } from "../logger";

export interface LogDevToolsProps {
  /** Initial position of the panel */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Maximum height of the log panel */
  maxHeight?: number;
  /** Custom styles for the container */
  style?: React.CSSProperties;
}

const levelColors: Record<LogLevel, string> = {
  debug: "#6b7280",
  info: "#3b82f6",
  warn: "#f59e0b",
  error: "#ef4444",
};

const levelBgColors: Record<LogLevel, string> = {
  debug: "#f3f4f6",
  info: "#eff6ff",
  warn: "#fffbeb",
  error: "#fef2f2",
};

const positionStyles: Record<string, React.CSSProperties> = {
  "bottom-right": { bottom: 16, right: 16 },
  "bottom-left": { bottom: 16, left: 16 },
  "top-right": { top: 16, right: 16 },
  "top-left": { top: 16, left: 16 },
};

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const timeStr = date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const ms = date.getMilliseconds().toString().padStart(3, "0");
  return `${timeStr}.${ms}`;
};

interface LogEntryRowProps {
  entry: LogEntry;
  isExpanded: boolean;
  onToggle: () => void;
}

const LogEntryRow = ({ entry, isExpanded, onToggle }: LogEntryRowProps) => {
  const hasDetails = entry.context || entry.errorStack || entry.metadata;

  return (
    <div
      style={{
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: levelBgColors[entry.level],
      }}
    >
      <div
        onClick={hasDetails ? onToggle : undefined}
        style={{
          display: "flex",
          alignItems: "flex-start",
          padding: "8px 12px",
          gap: "8px",
          cursor: hasDetails ? "pointer" : "default",
          fontSize: "12px",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      >
        <span
          style={{
            color: "#9ca3af",
            flexShrink: 0,
            fontSize: "11px",
          }}
        >
          {formatTime(entry.timestamp)}
        </span>
        <span
          style={{
            backgroundColor: levelColors[entry.level],
            color: "white",
            padding: "1px 6px",
            borderRadius: "4px",
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          {entry.level}
        </span>
        {entry.loggerName && (
          <span
            style={{
              backgroundColor: "#8b5cf6",
              color: "white",
              padding: "1px 6px",
              borderRadius: "4px",
              fontSize: "10px",
              flexShrink: 0,
            }}
          >
            {entry.loggerName}
          </span>
        )}
        <span
          style={{
            color: entry.level === "error" ? "#dc2626" : "#374151",
            flex: 1,
            wordBreak: "break-word",
          }}
        >
          {entry.message}
        </span>
        {hasDetails && (
          <span style={{ color: "#9ca3af", flexShrink: 0 }}>
            {isExpanded ? "▼" : "▶"}
          </span>
        )}
      </div>
      {isExpanded && hasDetails && (
        <div
          style={{
            padding: "8px 12px 12px 12px",
            backgroundColor: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          {entry.context && (
            <div
              style={{
                marginBottom: entry.errorStack || entry.metadata ? "8px" : 0,
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#6b7280",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                }}
              >
                Context
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: "8px",
                  backgroundColor: "#1f2937",
                  color: "#e5e7eb",
                  borderRadius: "4px",
                  fontSize: "11px",
                  overflow: "auto",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  textAlign: "left",
                }}
              >
                {JSON.stringify(entry.context, null, 2)}
              </pre>
            </div>
          )}
          {entry.metadata && (
            <div style={{ marginBottom: entry.errorStack ? "8px" : 0 }}>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#6b7280",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                }}
              >
                Metadata
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: "8px",
                  backgroundColor: "#1f2937",
                  color: "#e5e7eb",
                  borderRadius: "4px",
                  fontSize: "11px",
                  overflow: "auto",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  textAlign: "left",
                }}
              >
                {JSON.stringify(entry.metadata, null, 2)}
              </pre>
            </div>
          )}
          {entry.errorStack && (
            <div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#6b7280",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                }}
              >
                Stack Trace
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: "8px",
                  backgroundColor: "#fef2f2",
                  color: "#991b1b",
                  borderRadius: "4px",
                  fontSize: "10px",
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  textAlign: "left",
                }}
              >
                {entry.errorStack}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const LogDevTools = ({
  position = "bottom-right",
  defaultCollapsed = true,
  maxHeight = 400,
  style,
}: LogDevToolsProps) => {
  const logger = useLoggerContext();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [filter, setFilter] = useState<LogLevel | "all">("all");
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to new logs
  useEffect(() => {
    // Get initial logs
    setLogs(logger.getLogs());

    // Subscribe to updates
    const unsubscribe = logger.subscribe((entry) => {
      setLogs((prev) => [...prev, entry]);
    });

    return unsubscribe;
  }, [logger]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (!isCollapsed && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isCollapsed]);

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

  const filteredLogs = logs.filter((log) => {
    if (filter !== "all" && log.level !== filter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        log.message.toLowerCase().includes(searchLower) ||
        JSON.stringify(log.context).toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleClear = () => {
    logger.clearLogs();
    setLogs([]);
    setExpandedIds(new Set());
  };

  const handleDownload = () => {
    logger.downloadLog();
  };

  const errorCount = logs.filter((l) => l.level === "error").length;
  const warnCount = logs.filter((l) => l.level === "warn").length;

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 99999,
        fontFamily: "system-ui, -apple-system, sans-serif",
        ...positionStyles[position],
        ...style,
      }}
    >
      {/* Collapsed button */}
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            backgroundColor: "#1f2937",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 500,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          <span>📋</span>
          <span>Logs ({logs.length})</span>
          {errorCount > 0 && (
            <span
              style={{
                backgroundColor: "#ef4444",
                padding: "2px 6px",
                borderRadius: "10px",
                fontSize: "10px",
              }}
            >
              {errorCount}
            </span>
          )}
          {warnCount > 0 && (
            <span
              style={{
                backgroundColor: "#f59e0b",
                padding: "2px 6px",
                borderRadius: "10px",
                fontSize: "10px",
              }}
            >
              {warnCount}
            </span>
          )}
        </button>
      ) : (
        /* Expanded panel */
        <div
          style={{
            width: 450,
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              backgroundColor: "#1f2937",
              color: "white",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px" }}>📋</span>
              <span style={{ fontWeight: 600, fontSize: "14px" }}>
                LogDumper DevTools
              </span>
              <span
                style={{
                  backgroundColor: "#374151",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontSize: "11px",
                }}
              >
                {filteredLogs.length}
              </span>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={handleDownload}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#374151",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
                title="Download logs"
              >
                ⬇️
              </button>
              <button
                onClick={handleClear}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#374151",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
                title="Clear logs"
              >
                🗑️
              </button>
              <button
                onClick={() => setIsCollapsed(true)}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#374151",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
                title="Collapse"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              padding: "8px 12px",
              backgroundColor: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                padding: "6px 10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "12px",
                outline: "none",
              }}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as LogLevel | "all")}
              style={{
                padding: "6px 10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "12px",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              <option value="all">All levels</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>
          </div>

          {/* Logs list */}
          <div
            style={{
              maxHeight,
              overflowY: "auto",
            }}
          >
            {filteredLogs.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "13px",
                }}
              >
                {logs.length === 0
                  ? "No logs yet"
                  : "No logs match your filters"}
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
        </div>
      )}
    </div>
  );
};
