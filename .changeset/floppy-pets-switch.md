---
"@stevenmckinnon/log-dumper": minor
---

### New Features

- **Log Levels**: Added `logDebug`, `logInfo`, and `logWarn` methods alongside existing `logAction` and `logError`
- **Automatic Metadata**: Logs now capture URL, session ID, and user agent automatically
- **Error Boundary**: New `captureErrors` prop on `LogDumper` to auto-catch and log React errors with customizable fallback UI
- **Named Loggers**: Use `useLogger('name')` to create separate log streams for different parts of your app
- **DevTools Component**: New `LogDevTools` component for real-time log viewing with filtering, search, and log level badges
- **Console Forwarding**: New `forwardToConsole` option to mirror logs to browser console
- **TypeScript Generics**: `useLogger<TContext>()` now supports generics for type-safe context objects
- **Subscriptions**: New `subscribe()` method to react to log entries in real-time
- **Log Filtering**: `getLogs()` now accepts filters for level, type, time range, and search

### Improvements

- Each log entry now has a unique `id` for tracking
- Exported `Logger` class for standalone (non-React) usage
- Exported all TypeScript types (`LogEntry`, `LogLevel`, `LogMetadata`, etc.)
- Expanded peer dependencies to support React 18 and React 19

### Bug Fixes

- Fixed React externalization in build config to prevent duplicate React instances
