import { useState } from "react";
import "./App.css";
import { LogDumper, LogDevTools, useLogger } from "@stevenmckinnon/log-dumper";

// Example typed context for type-safe logging
interface AppLogContext {
  count?: number;
  component?: string;
  action?: string;
  userId?: string;
}

// Component that deliberately throws an error (to test error boundary)
const BuggyComponent = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error("This is a deliberate error to test the Error Boundary!");
  }

  return (
    <button
      onClick={() => setShouldThrow(true)}
      style={{
        backgroundColor: "#dc2626",
        color: "white",
        padding: "8px 16px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      💥 Trigger Crash (Error Boundary)
    </button>
  );
};

// Demo component using named logger
const AuthSection = () => {
  const { logInfo, logWarn, logError } = useLogger<AppLogContext>("auth", {
    forwardToConsole: true,
  });

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: "#faf5ff",
        borderRadius: "8px",
        border: "1px solid #e9d5ff",
      }}
    >
      <h3 style={{ margin: "0 0 12px 0", color: "#7e22ce" }}>
        🔐 Auth Section (Named Logger)
      </h3>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          onClick={() =>
            logInfo("User logged in", { userId: "user_123", action: "login" })
          }
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Log In
        </button>
        <button
          onClick={() =>
            logWarn("Session expiring soon", { userId: "user_123" })
          }
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Session Warning
        </button>
        <button
          onClick={() =>
            logError(new Error("Auth token expired"), { userId: "user_123" })
          }
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Auth Error
        </button>
      </div>
    </div>
  );
};

const DemoContent = () => {
  const [count, setCount] = useState(0);

  // Using typed context with the default logger
  const {
    logAction,
    logDebug,
    logInfo,
    logWarn,
    logError,
    downloadLog,
    clearLogs,
  } = useLogger<AppLogContext>();

  const handleIncrement = () => {
    logDebug("Increment button hover detected", { component: "Counter" });
    logAction("Increment button clicked", { count, component: "Counter" });
    setCount((c) => c + 1);
  };

  const handleDecrement = () => {
    logInfo("Decrement action", { count, component: "Counter" });
    setCount((c) => c - 1);
  };

  const handleWarn = () => {
    logWarn("This is a warning message", { count, action: "warn-test" });
  };

  const handleError = () => {
    try {
      throw new Error("Demo error for testing!");
    } catch (e) {
      logError(e as Error, { count, action: "error-test" });
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "2rem",
          marginBottom: "8px",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        📋 Log Dumper Demo
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Testing all the new features: log levels, error boundary, named loggers,
        DevTools, and more!
      </p>

      {/* Counter Section */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#f0fdf4",
          borderRadius: "12px",
          marginBottom: "20px",
          border: "1px solid #bbf7d0",
        }}
      >
        <h2 style={{ margin: "0 0 16px 0", color: "#166534" }}>
          🔢 Counter (Default Logger)
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={handleDecrement}
            style={{
              padding: "8px 16px",
              fontSize: "18px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            -
          </button>
          <span
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              minWidth: "60px",
              textAlign: "center",
              color: "#166534",
            }}
          >
            {count}
          </span>
          <button
            onClick={handleIncrement}
            style={{
              padding: "8px 16px",
              fontSize: "18px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            +
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={handleWarn}
            style={{
              padding: "6px 12px",
              backgroundColor: "#fbbf24",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ⚠️ Log Warning
          </button>
          <button
            onClick={handleError}
            style={{
              padding: "6px 12px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ❌ Log Error
          </button>
        </div>
      </div>

      {/* Named Logger Section */}
      <div style={{ marginBottom: "20px" }}>
        <AuthSection />
      </div>

      {/* Error Boundary Test */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#fef2f2",
          borderRadius: "12px",
          marginBottom: "20px",
          border: "1px solid #fecaca",
        }}
      >
        <h2 style={{ margin: "0 0 12px 0", color: "#991b1b" }}>
          💥 Error Boundary Test
        </h2>
        <p style={{ color: "#b91c1c", fontSize: "14px", marginBottom: "12px" }}>
          Click the button below to trigger a crash. The error will be caught
          and logged automatically.
        </p>
        <BuggyComponent />
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          paddingTop: "20px",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <button
          onClick={() => downloadLog("demo-logs.json")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          ⬇️ Download Logs
        </button>
        <button
          onClick={clearLogs}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          🗑️ Clear Logs
        </button>
      </div>

      <p style={{ marginTop: "32px", color: "#9ca3af", fontSize: "14px" }}>
        💡 Open the DevTools panel (bottom-right corner) to view logs in
        real-time!
      </p>
    </div>
  );
};

const App = () => (
  <LogDumper
    maxLogs={200}
    forwardToConsole
    captureErrors
    errorFallback={(error, reset) => (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          backgroundColor: "#fef2f2",
          borderRadius: "12px",
          margin: "20px",
        }}
      >
        <h2 style={{ color: "#dc2626", marginBottom: "12px" }}>
          🚨 Application Error
        </h2>
        <p style={{ color: "#991b1b", marginBottom: "20px" }}>
          {error.message}
        </p>
        <p style={{ color: "#6b7280", marginBottom: "20px", fontSize: "14px" }}>
          This error was automatically logged by the Error Boundary.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "12px 24px",
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Try Again
        </button>
      </div>
    )}
  >
    <DemoContent />
    <LogDevTools position="bottom-right" defaultCollapsed maxHeight={350} />
  </LogDumper>
);

export default App;
