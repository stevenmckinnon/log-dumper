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
    },
  },
  plugins: [dts({ insertTypesEntry: true })],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
