---
"@stevenmckinnon/log-dumper": patch
---

### Build Improvements

- Switched to `preserveModules` output — each source file is now emitted as its own module, enabling precise tree-shaking. Consumers who don't use `LogDevTools` no longer pay the cost of the `motion` dependency.
- Dropped UMD build — ES module output only, matching how all modern bundlers consume libraries.
- Updated `tsconfig.json` to use `moduleResolution: bundler`, aligning with Vite's module resolution strategy.
