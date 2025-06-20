# Log Dumper

A TypeScript library for capturing user actions and errors in React components, with downloadable logs for analysis.

## Features

- Log user actions and errors
- Download logs as a JSON file
- Easy React integration (Provider + Hook)
- Configurable maximum logs to keep
- Written in TypeScript
- Tested with Vitest

## Installation

```sh
pnpm add @stevenmckinnon/log-dumper
```

## Usage

### 1. Wrap your app with the `LogDumper` provider

```tsx
import { LogDumper } from "@stevenmckinnon/log-dumper";

<LogDumper maxLogs={100}>
  <App />
</LogDumper>
```

### 2. Log actions in your components

```tsx
import { useLogger } from "@stevenmckinnon/log-dumper";

const MyButton = () => {
  const { logAction } = useLogger();
  return <button onClick={() => logAction('Button clicked')}>Click me</button>;
};
```

### 3. Download the log

```tsx
const { downloadLog } = useLogger();
<button onClick={() => downloadLog()}>Download Log</button>
```

---

## Logger Options

You can pass options to the `LogDumper` provider:
- `maxLogs` (number): Maximum number of logs to keep in memory (oldest logs are dropped).

---

## Testing

Run tests with:

```sh
pnpm vitest
```
