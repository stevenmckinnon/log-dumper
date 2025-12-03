# Log Dumper

A TypeScript library for capturing user actions and errors in React applications, with real-time DevTools, automatic metadata capture, and downloadable logs for debugging and analysis.

## Features

- **Log Levels** - Debug, info, warn, and error severity levels
- **Automatic Metadata** - Captures URL, session ID, and user agent automatically
- **Error Boundary** - Auto-capture React crashes with built-in error boundary
- **Named Loggers** - Separate log streams for different parts of your app
- **DevTools Panel** - Real-time log viewer with filtering and search
- **Console Forwarding** - Mirror logs to browser console in development
- **TypeScript Generics** - Type-safe context objects
- **Download Logs** - Export logs as JSON for analysis
- **Subscriptions** - React to new log entries in real-time
- **Zero Dependencies** - Only peer dependencies on React

## Installation

```sh
npm install @stevenmckinnon/log-dumper
# or
pnpm add @stevenmckinnon/log-dumper
# or
yarn add @stevenmckinnon/log-dumper
```

## Quick Start

### 1. Wrap your app with the `LogDumper` provider

```tsx
import { LogDumper, LogDevTools } from "@stevenmckinnon/log-dumper";

const App = () => (
  <LogDumper maxLogs={200} forwardToConsole captureErrors>
    <YourApp />
    {/* Optional: Add DevTools for real-time log viewing */}
    <LogDevTools />
  </LogDumper>
);
```

### 2. Log actions in your components

```tsx
import { useLogger } from "@stevenmckinnon/log-dumper";

const MyButton = () => {
  const { logAction, logInfo, logWarn, logError } = useLogger();

  return (
    <button onClick={() => logAction('Button clicked', { buttonId: 'submit' })}>
      Click me
    </button>
  );
};
```

### 3. Download logs for debugging

```tsx
const { downloadLog } = useLogger();

<button onClick={() => downloadLog('debug-logs.json')}>
  Download Logs
</button>
```

---

## Log Levels

The library supports four log levels for different severity:

```tsx
const { logDebug, logInfo, logWarn, logError, logAction } = useLogger();

// Debug - verbose information for debugging
logDebug('Component rendered', { props });

// Info - general information
logInfo('User logged in', { userId: '123' });

// Action - alias for logInfo, kept for backwards compatibility
logAction('Button clicked', { buttonId: 'submit' });

// Warn - potential issues
logWarn('API response slow', { duration: 5000 });

// Error - errors and exceptions
try {
  await riskyOperation();
} catch (error) {
  logError(error, { operation: 'riskyOperation' });
}
```

---

## Provider Options

```tsx
<LogDumper
  maxLogs={200}              // Maximum logs to keep (oldest dropped)
  forwardToConsole={true}    // Mirror logs to browser console
  captureMetadata={true}     // Auto-capture URL, sessionId, userAgent
  captureErrors={true}       // Wrap children in error boundary
  errorFallback={...}        // Custom error UI (see Error Boundary section)
  onError={(error, info) => ...}  // Error callback
>
  <App />
</LogDumper>
```

---

## Error Boundary

Automatically catch and log React errors:

```tsx
<LogDumper
  captureErrors={true}
  errorFallback={(error, reset) => (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try Again</button>
    </div>
  )}
  onError={(error, errorInfo) => {
    // Optional: send to error tracking service
    sendToErrorTracking(error, errorInfo);
  }}
>
  <App />
</LogDumper>
```

---

## DevTools Component

Add a floating panel to view logs in real-time:

```tsx
import { LogDumper, LogDevTools } from "@stevenmckinnon/log-dumper";

<LogDumper>
  <App />
  <LogDevTools
    position="bottom-right"    // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    defaultCollapsed={true}    // Start collapsed
    defaultVisible={false}     // Panel visibility on mount
    maxHeight={400}            // Max panel height in pixels
    theme="dark"               // 'dark' | 'light'
    keyboardShortcut={{        // Customize keyboard shortcut (or false to disable)
      key: 'd',
      metaKey: true,
      shiftKey: true
    }}
  />
</LogDumper>
```

Features:
- Real-time log updates
- Filter by log level
- Search through logs
- Expand entries to view context, metadata, and stack traces
- Download and clear logs
- Badge counts for errors and warnings
- Light and dark themes
- Customizable keyboard shortcut to toggle visibility (default: Cmd/Ctrl+Shift+D)

---

## Named Loggers

Create separate log streams for different parts of your app:

```tsx
import { useLogger } from "@stevenmckinnon/log-dumper";

// In your auth components
const AuthForm = () => {
  const { logInfo, logError } = useLogger('auth');

  const handleLogin = async () => {
    logInfo('Login attempted', { email });
    try {
      await login(email, password);
      logInfo('Login successful');
    } catch (error) {
      logError(error, { email });
    }
  };
};

// In your checkout components
const Checkout = () => {
  const { logAction } = useLogger('checkout');

  logAction('Item added to cart', { itemId, quantity });
};
```

Logs from named loggers include a `loggerName` field for easy filtering.

---

## TypeScript Generics

Get type-safe context objects:

```tsx
interface UserActionContext {
  userId: string;
  page: string;
  timestamp?: number;
}

const MyComponent = () => {
  const { logAction } = useLogger<UserActionContext>();

  // TypeScript will enforce the context shape
  logAction('Page viewed', {
    userId: '123',
    page: '/dashboard',
    // timestamp is optional
  });

  // Error: 'invalid' is not assignable to UserActionContext
  // logAction('Click', { invalid: true });
};
```

---

## Subscriptions

React to new log entries in real-time:

```tsx
const { subscribe } = useLogger();

useEffect(() => {
  const unsubscribe = subscribe((entry) => {
    if (entry.level === 'error') {
      // Send errors to analytics
      analytics.track('error', {
        message: entry.message,
        stack: entry.errorStack,
      });
    }
  });

  return unsubscribe;
}, []);
```

---

## Log Filtering

Query logs with filters:

```tsx
const { getLogs } = useLogger();

// Get all logs
const allLogs = getLogs();

// Filter by level
const errors = getLogs({ level: 'error' });

// Filter by type
const actions = getLogs({ type: 'action' });

// Filter by time
const recentLogs = getLogs({ since: new Date(Date.now() - 60000) });

// Search in message and context
const searchResults = getLogs({ search: 'login' });
```

---

## Log Entry Structure

Each log entry contains:

```typescript
interface LogEntry {
  id: string;              // Unique log ID
  level: 'debug' | 'info' | 'warn' | 'error';
  type: 'action' | 'error';
  message: string;
  timestamp: string;       // ISO 8601
  context?: object;        // Your custom context
  errorStack?: string;     // Stack trace for errors
  loggerName?: string;     // Named logger identifier
  metadata?: {
    url: string;           // Current page URL
    sessionId: string;     // Browser session ID
    userAgent: string;     // Browser info
    componentName?: string;
  };
}
```

---

## Console Forwarding

Mirror logs to the browser console for development:

```tsx
<LogDumper forwardToConsole={process.env.NODE_ENV === 'development'}>
  <App />
</LogDumper>
```

Or per named logger:

```tsx
const { logInfo } = useLogger('debug-logger', { forwardToConsole: true });
```

---

## Using Without React

The `Logger` class can be used standalone:

```typescript
import { Logger } from "@stevenmckinnon/log-dumper";

const logger = new Logger({
  maxLogs: 100,
  forwardToConsole: true,
  name: 'my-app',
});

logger.logInfo('Application started');
logger.logError(new Error('Something went wrong'));

// Get logs
const logs = logger.getLogs();

// Download logs
logger.downloadLog('app-logs.json');
```

---

## API Reference

### `useLogger<TContext>(name?, options?)`

Returns logging functions bound to the LogDumper context.

| Method | Description |
|--------|-------------|
| `logDebug(message, context?, componentName?)` | Log debug message |
| `logInfo(message, context?, componentName?)` | Log info message |
| `logWarn(message, context?, componentName?)` | Log warning |
| `logAction(message, context?, componentName?)` | Log action (alias for logInfo) |
| `logError(error, context?, componentName?)` | Log error with stack trace |
| `getLogs(filter?)` | Get logs, optionally filtered |
| `clearLogs()` | Clear all logs |
| `downloadLog(filename?)` | Download logs as JSON |
| `subscribe(callback)` | Subscribe to new log entries |

### `LogDumper` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxLogs` | `number` | `undefined` | Max logs to keep |
| `forwardToConsole` | `boolean` | `false` | Mirror to console |
| `captureMetadata` | `boolean` | `true` | Auto-capture metadata |
| `captureErrors` | `boolean` | `false` | Enable error boundary |
| `errorFallback` | `ReactNode \| Function` | Default UI | Error boundary fallback |
| `onError` | `Function` | `undefined` | Error callback |

### `LogDevTools` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `string` | `'bottom-right'` | Panel position: `'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'` |
| `defaultCollapsed` | `boolean` | `true` | Start collapsed when visible |
| `defaultVisible` | `boolean` | `false` | Whether the DevTools panel is visible by default |
| `maxHeight` | `number` | `400` | Max panel height in pixels |
| `theme` | `'dark' \| 'light'` | `'dark'` | Theme variant |
| `keyboardShortcut` | `object \| false` | `{ key: 'd', metaKey: true, shiftKey: true }` | Keyboard shortcut to toggle visibility (Cmd/Ctrl+Shift+D by default). Set to `false` to disable |
| `className` | `string` | `''` | Custom class name for the container |
| `style` | `React.CSSProperties` | `undefined` | Custom styles for the container |

---

## Testing

```sh
pnpm test
```

---

## License

MIT
