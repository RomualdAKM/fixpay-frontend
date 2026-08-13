import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiError } from "@/lib/api";

/**
 * Map a caught error onto react-hook-form field errors.
 *
 * On a 422 the backend returns `errors` as `{ field: [messages] }`
 * (Laravel validation); `ApiError.fieldErrors` has already flattened it to
 * `field -> first message`. Each entry is set with type `"server"` so the form
 * shows the backend's message next to the offending field.
 *
 * Returns true when the error was a validation error that produced at least one
 * field message — the caller can then skip showing a generic banner. Non-422
 * errors (401, 429, network) return false so the caller surfaces them inline.
 */
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (!(error instanceof ApiError) || !error.isValidation) return false;

  const entries = Object.entries(error.fieldErrors);
  for (const [field, message] of entries) {
    setError(field as Path<T>, { type: "server", message });
  }
  return entries.length > 0;
}
