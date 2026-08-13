import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAutoDismiss } from "./useAutoDismiss";

const DELAY = 45_000;

describe("useAutoDismiss", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("does not fire while inactive", () => {
    const reset = vi.fn();
    renderHook(() => useAutoDismiss(false, reset, DELAY));
    act(() => vi.advanceTimersByTime(DELAY * 2));
    expect(reset).not.toHaveBeenCalled();
  });

  it("fires exactly once after the delay while active", () => {
    const reset = vi.fn();
    renderHook(() => useAutoDismiss(true, reset, DELAY));
    act(() => vi.advanceTimersByTime(DELAY - 1));
    expect(reset).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("cancels the timer when it goes inactive before the delay (manual hide)", () => {
    const reset = vi.fn();
    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => useAutoDismiss(active, reset, DELAY),
      { initialProps: { active: true } },
    );
    act(() => vi.advanceTimersByTime(DELAY / 2));
    rerender({ active: false });
    act(() => vi.advanceTimersByTime(DELAY));
    expect(reset).not.toHaveBeenCalled();
  });

  it("cancels the timer on unmount", () => {
    const reset = vi.fn();
    const { unmount } = renderHook(() => useAutoDismiss(true, reset, DELAY));
    act(() => vi.advanceTimersByTime(DELAY / 2));
    unmount();
    act(() => vi.advanceTimersByTime(DELAY));
    expect(reset).not.toHaveBeenCalled();
  });
});
