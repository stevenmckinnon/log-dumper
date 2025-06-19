# logger-dumper

A TypeScript library for capturing user actions and errors in React components, with downloadable logs for analysis.

## Features
- Log user actions and errors
- Download logs as a JSON file
- Easy React integration (Provider + Hook)
- Written in TypeScript
- Tested with Vitest

## Installation
```sh
pnpm add logger-dumper
```

## Usage

### 1. Wrap your app with the `LoggerProvider`
```tsx
import { LoggerProvider } from 'logger-dumper/react/LoggerProvider';

<LoggerProvider>
  <App />
</LoggerProvider>
```

### 2. Log actions in your components
```tsx
import { useLogger } from 'logger-dumper/react/useLogger';

const MyButton = () => {
  const { logAction } = useLogger();
  return <button onClick={() => logAction('Button clicked')}>Click me</button>;
};
```

### 3. Download the log
```tsx
const { downloadLog } = useLogger();
<button onClick={downloadLog}>Download Log</button>
```

---

## Testing
Run tests with:
```sh
pnpm vitest
```
