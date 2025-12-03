// Runtime CSS injection for DevTools
// This allows the component to work without requiring users to import a CSS file
// Users can override these styles with Tailwind or their own CSS

const STYLE_ID = 'log-dumper-devtools-styles';

export const injectStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS_CONTENT;
  document.head.appendChild(style);
};

const CSS_CONTENT = `
/* Log Dumper DevTools - Default Styles */
/* Override with Tailwind or custom CSS using .ld-* classes */

:root {
  --ld-font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --ld-font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  
  /* Sizing */
  --ld-radius-sm: 4px;
  --ld-radius-md: 6px;
  --ld-radius-lg: 12px;
}

/* Dark theme (default) */
.ld-devtools--dark {
  /* Dark theme colors */
  --ld-bg-primary: #09090b;
  --ld-bg-secondary: #18181b;
  --ld-bg-tertiary: #27272a;
  --ld-bg-hover: #3f3f46;
  
  --ld-border: #27272a;
  --ld-border-subtle: #3f3f46;
  
  --ld-text-primary: #fafafa;
  --ld-text-secondary: #a1a1aa;
  --ld-text-muted: #71717a;
  
  --ld-accent: #8b5cf6;
  --ld-accent-hover: #7c3aed;
  
  /* Log level colors */
  --ld-debug-bg: rgba(113, 113, 122, 0.1);
  --ld-debug-text: #a1a1aa;
  --ld-debug-badge: #52525b;
  
  --ld-info-bg: rgba(59, 130, 246, 0.1);
  --ld-info-text: #60a5fa;
  --ld-info-badge: #3b82f6;
  
  --ld-warn-bg: rgba(245, 158, 11, 0.1);
  --ld-warn-text: #fbbf24;
  --ld-warn-badge: #f59e0b;
  
  --ld-error-bg: rgba(239, 68, 68, 0.1);
  --ld-error-text: #f87171;
  --ld-error-badge: #ef4444;
  
  /* Shadows */
  --ld-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  --ld-shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

/* Light theme */
.ld-devtools--light {
  /* Light theme colors */
  --ld-bg-primary: #ffffff;
  --ld-bg-secondary: #f4f4f5;
  --ld-bg-tertiary: #e4e4e7;
  --ld-bg-hover: #d4d4d8;
  
  --ld-border: #e4e4e7;
  --ld-border-subtle: #d4d4d8;
  
  --ld-text-primary: #09090b;
  --ld-text-secondary: #52525b;
  --ld-text-muted: #a1a1aa;
  
  --ld-accent: #8b5cf6;
  --ld-accent-hover: #7c3aed;
  
  /* Log level colors */
  --ld-debug-bg: rgba(113, 113, 122, 0.08);
  --ld-debug-text: #52525b;
  --ld-debug-badge: #71717a;
  
  --ld-info-bg: rgba(59, 130, 246, 0.1);
  --ld-info-text: #2563eb;
  --ld-info-badge: #3b82f6;
  
  --ld-warn-bg: rgba(245, 158, 11, 0.12);
  --ld-warn-text: #d97706;
  --ld-warn-badge: #f59e0b;
  
  --ld-error-bg: rgba(239, 68, 68, 0.12);
  --ld-error-text: #dc2626;
  --ld-error-badge: #ef4444;
  
  /* Shadows */
  --ld-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  --ld-shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Base container */
.ld-devtools {
  font-family: var(--ld-font-sans);
  font-size: 13px;
  line-height: 1.5;
  color: var(--ld-text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Default to dark theme if no theme class is specified */
.ld-devtools:not(.ld-devtools--light):not(.ld-devtools--dark) {
  --ld-bg-primary: #09090b;
  --ld-bg-secondary: #18181b;
  --ld-bg-tertiary: #27272a;
  --ld-bg-hover: #3f3f46;
  --ld-border: #27272a;
  --ld-border-subtle: #3f3f46;
  --ld-text-primary: #fafafa;
  --ld-text-secondary: #a1a1aa;
  --ld-text-muted: #71717a;
  --ld-accent: #8b5cf6;
  --ld-accent-hover: #7c3aed;
  --ld-debug-bg: rgba(113, 113, 122, 0.1);
  --ld-debug-text: #a1a1aa;
  --ld-debug-badge: #52525b;
  --ld-info-bg: rgba(59, 130, 246, 0.1);
  --ld-info-text: #60a5fa;
  --ld-info-badge: #3b82f6;
  --ld-warn-bg: rgba(245, 158, 11, 0.1);
  --ld-warn-text: #fbbf24;
  --ld-warn-badge: #f59e0b;
  --ld-error-bg: rgba(239, 68, 68, 0.1);
  --ld-error-text: #f87171;
  --ld-error-badge: #ef4444;
  --ld-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  --ld-shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

/* Collapsed trigger button */
.ld-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--ld-bg-primary);
  color: var(--ld-text-primary);
  border: 1px solid var(--ld-border);
  border-radius: var(--ld-radius-lg);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--ld-font-sans);
  box-shadow: var(--ld-shadow);
  transition: all 0.15s ease;
  backdrop-filter: blur(8px);
}

.ld-trigger:hover {
  background: var(--ld-bg-secondary);
  border-color: var(--ld-border-subtle);
  transform: translateY(-1px);
}

.ld-trigger:active {
  transform: translateY(0);
}

.ld-trigger-icon {
  font-size: 16px;
}

.ld-trigger-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--ld-bg-tertiary);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.ld-trigger-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 600;
}

.ld-trigger-badge--error {
  background: var(--ld-error-badge);
  color: white;
}

.ld-trigger-badge--warn {
  background: var(--ld-warn-badge);
  color: black;
}

/* Main panel */
.ld-panel {
  width: 480px;
  max-width: calc(100vw - 32px);
  background: var(--ld-bg-primary);
  border: 1px solid var(--ld-border);
  border-radius: var(--ld-radius-lg);
  box-shadow: var(--ld-shadow);
  overflow: hidden;
  backdrop-filter: blur(8px);
}

/* Panel header */
.ld-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--ld-bg-secondary);
  border-bottom: 1px solid var(--ld-border);
}

.ld-header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ld-header-icon {
  font-size: 18px;
}

.ld-header-text {
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.01em;
}

.ld-header-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 22px;
  padding: 0 8px;
  background: var(--ld-bg-tertiary);
  border-radius: 11px;
  font-size: 11px;
  font-weight: 500;
  color: var(--ld-text-secondary);
}

.ld-header-actions {
  display: flex;
  gap: 4px;
}

.ld-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  color: var(--ld-text-secondary);
  border: none;
  border-radius: var(--ld-radius-md);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s ease;
}

.ld-btn:hover {
  background: var(--ld-bg-tertiary);
  color: var(--ld-text-primary);
}

.ld-btn:active {
  background: var(--ld-bg-hover);
}

.ld-btn--danger:hover {
  background: var(--ld-error-bg);
  color: var(--ld-error-text);
}

/* Toolbar */
.ld-toolbar {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background: var(--ld-bg-secondary);
  border-bottom: 1px solid var(--ld-border);
}

.ld-search {
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  background: var(--ld-bg-primary);
  color: var(--ld-text-primary);
  border: 1px solid var(--ld-border);
  border-radius: var(--ld-radius-md);
  font-size: 12px;
  font-family: var(--ld-font-sans);
  outline: none;
  transition: all 0.15s ease;
}

.ld-search::placeholder {
  color: var(--ld-text-muted);
}

.ld-search:focus {
  border-color: var(--ld-accent);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.ld-select {
  padding: 8px 32px 8px 12px;
  background: var(--ld-bg-primary);
  color: var(--ld-text-primary);
  border: 1px solid var(--ld-border);
  border-radius: var(--ld-radius-md);
  font-size: 12px;
  font-family: var(--ld-font-sans);
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: all 0.15s ease;
}

.ld-select:focus {
  border-color: var(--ld-accent);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.ld-select option {
  background: var(--ld-bg-primary);
  color: var(--ld-text-primary);
}

/* Logs container */
.ld-logs {
  overflow-y: auto;
  overscroll-behavior: contain;
}

.ld-logs::-webkit-scrollbar {
  width: 8px;
}

.ld-logs::-webkit-scrollbar-track {
  background: transparent;
}

.ld-logs::-webkit-scrollbar-thumb {
  background: var(--ld-bg-tertiary);
  border-radius: 4px;
}

.ld-logs::-webkit-scrollbar-thumb:hover {
  background: var(--ld-bg-hover);
}

/* Empty state */
.ld-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: var(--ld-text-muted);
  text-align: center;
}

.ld-empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.ld-empty-text {
  font-size: 13px;
}

/* Log entry */
.ld-entry {
  border-bottom: 1px solid var(--ld-border);
  transition: background 0.1s ease;
}

.ld-entry:last-child {
  border-bottom: none;
}

.ld-entry--debug { background: var(--ld-debug-bg); }
.ld-entry--info { background: var(--ld-info-bg); }
.ld-entry--warn { background: var(--ld-warn-bg); }
.ld-entry--error { background: var(--ld-error-bg); }

.ld-entry-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.1s ease;
}

.ld-entry-row:hover {
  background: var(--ld-bg-hover);
  opacity: 0.8;
}

.ld-entry-row--no-details {
  cursor: default;
}

.ld-entry-row--no-details:hover {
  background: transparent;
}

.ld-entry-time {
  flex-shrink: 0;
  font-family: var(--ld-font-mono);
  font-size: 11px;
  color: var(--ld-text-muted);
  padding-top: 2px;
}

.ld-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: var(--ld-radius-sm);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.ld-badge--debug {
  background: var(--ld-debug-badge);
  color: white;
}

.ld-badge--info {
  background: var(--ld-info-badge);
  color: white;
}

.ld-badge--warn {
  background: var(--ld-warn-badge);
  color: black;
}

.ld-badge--error {
  background: var(--ld-error-badge);
  color: white;
}

.ld-badge--logger {
  background: var(--ld-accent);
  color: white;
  text-transform: none;
  font-weight: 500;
}

.ld-entry-message {
  flex: 1;
  min-width: 0;
  font-family: var(--ld-font-mono);
  font-size: 12px;
  line-height: 1.5;
  word-break: break-word;
  color: var(--ld-text-primary);
}

.ld-entry--error .ld-entry-message {
  color: var(--ld-error-text);
}

.ld-entry-chevron {
  flex-shrink: 0;
  color: var(--ld-text-muted);
  font-size: 10px;
  padding-top: 3px;
  transition: transform 0.2s ease;
}

.ld-entry-chevron--expanded {
  transform: rotate(90deg);
}

/* Log entry details */
.ld-details {
  padding: 0 12px 12px 12px;
  overflow: hidden;
}

.ld-details-section {
  margin-top: 8px;
}

.ld-details-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ld-text-muted);
}

.ld-details-pre {
  margin: 0;
  padding: 10px 12px;
  background: var(--ld-bg-tertiary);
  border-radius: var(--ld-radius-md);
  font-family: var(--ld-font-mono);
  font-size: 11px;
  line-height: 1.6;
  color: var(--ld-text-secondary);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.ld-details-pre--stack {
  background: var(--ld-error-bg);
  color: var(--ld-error-text);
  font-size: 10px;
}

/* Resize handle */
.ld-resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  cursor: ew-resize;
  background: transparent;
  transition: background 0.15s ease;
}

.ld-resize-handle:hover {
  background: var(--ld-accent);
}

/* Keyboard hint */
.ld-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--ld-bg-tertiary);
  border: 1px solid var(--ld-border-subtle);
  border-radius: 4px;
  font-family: var(--ld-font-mono);
  font-size: 10px;
  font-weight: 500;
  color: var(--ld-text-muted);
}

/* Animations for non-motion fallback */
@keyframes ld-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes ld-slide-up {
  from { 
    opacity: 0;
    transform: translateY(8px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.ld-animate-in {
  animation: ld-slide-up 0.2s ease-out;
}
`;

