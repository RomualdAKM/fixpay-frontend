import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api";
import { applyApiErrors } from "@/lib/forms/applyApiErrors";

interface Values {
  email: string;
  password: string;
}

describe("applyApiErrors", () => {
  it("fills react-hook-form field errors from a 422", () => {
    const { result } = renderHook(() => {
      const form = useForm<Values>({
        defaultValues: { email: "", password: "" },
      });
      // Access `errors` during render so RHF's formState proxy subscribes and
      // the hook re-renders when setError fires.
      void form.formState.errors;
      return form;
    });

    const error = new ApiError(422, "The given data was invalid.", {
      email: ["The email field is required."],
      password: ["The password must be at least 12 characters."],
    });

    let handled = false;
    act(() => {
      handled = applyApiErrors(error, result.current.setError);
    });

    expect(handled).toBe(true);
    expect(result.current.formState.errors.email?.message).toBe(
      "The email field is required.",
    );
    expect(result.current.formState.errors.password?.message).toBe(
      "The password must be at least 12 characters.",
    );
  });

  it("returns false for non-validation errors and touches no field", () => {
    const { result } = renderHook(() => {
      const form = useForm<Values>({
        defaultValues: { email: "", password: "" },
      });
      // Access `errors` during render so RHF's formState proxy subscribes and
      // the hook re-renders when setError fires.
      void form.formState.errors;
      return form;
    });

    const error = new ApiError(401, "invalid_credentials", {
      code: "invalid_credentials",
    });

    let handled = true;
    act(() => {
      handled = applyApiErrors(error, result.current.setError);
    });

    expect(handled).toBe(false);
    expect(result.current.formState.errors.email).toBeUndefined();
    expect(result.current.formState.errors.password).toBeUndefined();
  });
});
