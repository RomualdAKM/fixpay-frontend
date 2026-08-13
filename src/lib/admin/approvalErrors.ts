import { ApiError } from "@/lib/api/ApiError";

/**
 * The backend error code (App\Services\Approval\Exceptions\SelfApprovalException,
 * rendered as a 422 with `errors.code`) raised when a maker tries to decide
 * their own approval request. Separation of duties: the requester can never be
 * the approver.
 */
export const SELF_APPROVAL_CODE = "self_approval_forbidden";

/** True when a caught error is the backend's self-approval refusal. */
export function isSelfApprovalError(error: unknown): boolean {
  return error instanceof ApiError && error.code === SELF_APPROVAL_CODE;
}
