---
"@stevenmckinnon/log-dumper": patch
---

Fix TypeScript types not resolving for consumers

Switched `vite-plugin-dts` from `insertTypesEntry` to `rollupTypes`, which bundles all declarations into a single `dist/index.d.ts`. Previously the file was empty and the actual types were output to `dist/src/`, making the package unusable in TypeScript projects.
