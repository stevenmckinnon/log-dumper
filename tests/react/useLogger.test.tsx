import React from "react";
import { renderHook } from "@testing-library/react";

import { LoggerProvider } from "../../src/LoggerProvider/LoggerProvider";
import { useLogger } from "../../src/useLogger/useLogger";
import { describe, it, expect } from "vitest";

describe("useLogger", function () {
  it("provides logAction and logError", function () {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LoggerProvider>{children}</LoggerProvider>
    );
    const { result } = renderHook(() => useLogger(), { wrapper });
    expect(typeof result.current.logAction).toBe("function");
    expect(typeof result.current.logError).toBe("function");
  });
});
