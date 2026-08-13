/**
 * The uniform response envelope every FixPay endpoint returns
 * (App\Support\ApiResponse). On Laravel's default validation failure the body
 * omits `data` and carries `errors` as a field → messages map, which this type
 * also covers via the optional `data`.
 */
export interface ApiEnvelope<T> {
  message: string | null;
  data: T | null;
  errors: Record<string, unknown> | null;
}

/** A field-name → first-message map, ready to feed into a form. */
export type FieldErrors = Record<string, string>;

/**
 * A typed transport/HTTP error. Carries the HTTP `status`, the envelope
 * `message`, and — when the backend returned a 422 with a validation bag — a
 * normalized `fieldErrors` map (first message per field) plus the raw `errors`.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;
  readonly errors: Record<string, unknown> | null;
  /** Machine-readable error code when the backend sends `errors.code`. */
  readonly code: string | null;

  constructor(
    status: number,
    message: string,
    errors: Record<string, unknown> | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.fieldErrors = extractFieldErrors(errors);
    this.code = typeof errors?.code === "string" ? errors.code : null;
    // Restore the prototype chain for `instanceof` under transpiled targets.
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /** 401 — not authenticated: the caller should route to /login. */
  get isUnauthenticated(): boolean {
    return this.status === 401;
  }

  /** 422 — validation: `fieldErrors` maps onto form fields. */
  get isValidation(): boolean {
    return this.status === 422;
  }

  /** 403 — authenticated but forbidden. */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** 429 — rate limited. */
  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

/**
 * Normalize an `errors` bag into `field -> message`.
 * Laravel validation: `{ email: ["The email field is required."] }`.
 * Manual ApiResponse::error bags (e.g. `{ code: "invalid_credentials" }`) yield
 * no usable field entries and are safely dropped from the form map.
 */
function extractFieldErrors(
  errors: Record<string, unknown> | null,
): FieldErrors {
  if (!errors) return {};

  const result: FieldErrors = {};
  for (const [field, value] of Object.entries(errors)) {
    if (field === "code") continue;
    if (Array.isArray(value)) {
      const first = value.find((item): item is string => typeof item === "string");
      if (first !== undefined) result[field] = first;
    } else if (typeof value === "string") {
      result[field] = value;
    }
  }
  return result;
}
