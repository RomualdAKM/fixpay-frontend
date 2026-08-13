import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/** One option of an `AdminSelectField`. */
export interface SelectOption {
  value: string;
  label: string;
}

interface AdminSelectFieldProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  /** Leading empty option label, e.g. "— (global) —". Omit for no blank. */
  placeholder?: string;
}

/**
 * Labelled native `<select>` that forwards its ref so react-hook-form's
 * `register` binds directly. Same field chrome as `TextField`; error wired via
 * `aria-invalid` + `aria-describedby`.
 */
export const AdminSelectField = forwardRef<
  HTMLSelectElement,
  AdminSelectFieldProps
>(function AdminSelectField(
  { label, options, error, hint, placeholder, id, className, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const describedById = `${fieldId}-desc`;

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="text-text-secondary block text-[13px] leading-[18px] font-medium"
      >
        {label}
      </label>
      <div className="relative mt-[6px]">
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? describedById : undefined}
          className={cn(
            "border-border-strong bg-surface text-text h-12 w-full appearance-none rounded-md border pr-11 pl-[17px] text-[15px] outline-none",
            "hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/60 transition-colors focus-visible:ring-2 focus-visible:outline-none",
            error && "border-danger focus-visible:border-danger",
            className,
          )}
          {...props}
        >
          {placeholder !== undefined ? (
            <option value="" className="bg-bg text-text">
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-bg text-text"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          aria-hidden="true"
          className="text-icon-muted pointer-events-none absolute top-1/2 right-[15px] -translate-y-1/2"
        />
      </div>
      {(error || hint) && (
        <p
          id={describedById}
          className={cn(
            "mt-[6px] text-[12px] leading-[16px]",
            error ? "text-danger" : "text-text-muted",
          )}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
});

interface CheckboxFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

/**
 * Labelled checkbox that forwards its ref for `register`. Used for the boolean
 * curation flags (fixpay_enabled, requires_email, effective).
 */
export const AdminCheckboxField = forwardRef<
  HTMLInputElement,
  CheckboxFieldProps
>(function AdminCheckboxField({ label, hint, id, className, ...props }, ref) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <label
      htmlFor={fieldId}
      className="border-border-strong bg-surface hover:bg-surface-2 flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 transition-colors"
    >
      <input
        ref={ref}
        id={fieldId}
        type="checkbox"
        className={cn(
          "accent-primary mt-0.5 size-4 shrink-0 cursor-pointer",
          className,
        )}
        {...props}
      />
      <span>
        <span className="text-text block text-[14px] font-medium">{label}</span>
        {hint ? (
          <span className="text-text-muted mt-0.5 block text-[12px] leading-[16px]">
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  );
});

/** Right-aligned footer for modal forms: Cancel + submit. */
export function FormActions({
  onCancel,
  submitLabel,
  pending,
}: {
  onCancel: () => void;
  submitLabel: string;
  pending: boolean;
}) {
  return (
    <div className="mt-2 flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="border-border bg-surface text-text hover:bg-surface-2 focus-visible:ring-primary/60 flex h-11 items-center justify-center rounded-md border px-5 text-[14px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        Annuler
      </button>
      <button
        type="submit"
        disabled={pending}
        className="bg-primary focus-visible:ring-primary/60 flex h-11 items-center justify-center rounded-md px-5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
      >
        {pending ? "Envoi…" : submitLabel}
      </button>
    </div>
  );
}
