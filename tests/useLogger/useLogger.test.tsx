import React from "react";
import { renderHook } from "@testing-library/react";

import { LogDumper, useNamedLogger } from "../../src/LogDumper/LogDumper";
import { useLogger } from "../../src/useLogger/useLogger";
import { describe, it, expect, vi } from "vitest";

describe("useLogger", function () {
  it("provides logAction and logError", function () {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LogDumper>{children}</LogDumper>
    );
    const { result } = renderHook(() => useLogger(), { wrapper });
    expect(typeof result.current.logAction).toBe("function");
    expect(typeof result.current.logError).toBe("function");
  });
});

describe("useNamedLogger - configuration inheritance", function () {
  it("inherits forwardToConsole from parent LogDumper", function () {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LogDumper forwardToConsole={true}>{children}</LogDumper>
    );
    
    const { result } = renderHook(() => useNamedLogger("test-logger"), { wrapper });
    
    // Log something with the named logger
    result.current.logAction("Test message");
    
    // Verify console.info was called (forwardToConsole was inherited)
    expect(infoSpy).toHaveBeenCalled();
    
    infoSpy.mockRestore();
  });

  it("inherits captureMetadata from parent LogDumper", function () {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LogDumper captureMetadata={false}>{children}</LogDumper>
    );
    
    const { result } = renderHook(() => useNamedLogger("test-logger"), { wrapper });
    result.current.logAction("Test message");
    
    const logs = result.current.getLogs();
    // When captureMetadata is false, metadata should be undefined
    expect(logs[0].metadata).toBeUndefined();
  });

  it("inherits maxLogs from parent LogDumper", function () {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LogDumper maxLogs={2}>{children}</LogDumper>
    );
    
    const { result } = renderHook(() => useNamedLogger("test-logger"), { wrapper });
    
    // Add 3 logs
    result.current.logAction("Log 1");
    result.current.logAction("Log 2");
    result.current.logAction("Log 3");
    
    // Should only have 2 logs due to maxLogs inheritance
    const logs = result.current.getLogs();
    expect(logs.length).toBe(2);
    expect(logs[0].message).toBe("Log 2");
    expect(logs[1].message).toBe("Log 3");
  });

  it("allows explicit override of inherited options", function () {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LogDumper forwardToConsole={true}>{children}</LogDumper>
    );
    
    // Explicitly disable forwardToConsole for this named logger
    const { result } = renderHook(
      () => useNamedLogger("test-logger", { forwardToConsole: false }),
      { wrapper }
    );
    
    result.current.logAction("Test message");
    
    // console.info should NOT be called because we explicitly disabled it
    expect(infoSpy).not.toHaveBeenCalled();
    
    infoSpy.mockRestore();
  });
});
