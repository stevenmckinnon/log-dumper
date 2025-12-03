import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "LogDumper",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "umd"],
    },
    outDir: "dist",
    rollupOptions: {
      // Externalize all React-related packages to avoid bundling them
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
        },
      },
      onwarn(warning, warn) {
        // Suppress "use client" directive warnings from framer-motion
        // These are harmless Next.js directives that are safely ignored when bundling
        if (
          (warning.code === 'MODULE_LEVEL_DIRECTIVE' || warning.id?.includes('framer-motion')) &&
          warning.message?.includes('use client')
        ) {
          return;
        }
        warn(warning);
      },
    },
    // Suppress verbose warnings about "use client" directives in framer-motion
    // These are harmless Next.js directives that don't affect functionality
    logLevel: 'warn',
  },
  plugins: [dts({ insertTypesEntry: true })],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
