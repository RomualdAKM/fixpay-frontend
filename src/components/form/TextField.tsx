import { forwardRef, useId, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Validation message shown under the field. */
  error?: string;
  /** Helper text shown under the field when there is no error. */
  hint?: string;
}

/**
 * Labelled text input built on the product tokens (same field chrome as
 * `AmountInput` text variant: h-12, `rounded-md`, `border-border-strong`,
 * `bg-surface`). Forwards its ref so react-hook-form's `register` binds
 * directly. The label is a real `<label for>`; the error is wired via
 * `aria-describedby` + `aria-invalid`.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ label, error, hint, id, className, ...props }, ref) {
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
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? describedById : undefined}
          className={cn(
            "border-border-strong bg-surface text-text placeholder:text-text-muted mt-[6px] h-12 w-full rounded-md border px-[17px] text-[15px] outline-none",
            "hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/60 transition-colors focus-visible:ring-2 focus-visible:outline-none",
            error && "border-danger focus-visible:border-danger",
            className,
          )}
          {...props}
        />
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
  },
);
