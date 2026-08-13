"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  hint?: string;
}

/**
 * Password input matching `TextField`, with an inline show/hide toggle. The
 * toggle is a real button carrying an explicit `aria-label`, and never submits
 * the form (`type="button"`). Forwards its ref for react-hook-form `register`.
 */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ label, error, hint, id, className, ...props }, ref) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const describedById = `${fieldId}-desc`;
    const [visible, setVisible] = useState(false);

    return (
      <div>
        <label
          htmlFor={fieldId}
          className="text-text-secondary block text-[13px] leading-[18px] font-medium"
        >
          {label}
        </label>
        <div className="relative mt-[6px]">
          <input
            ref={ref}
            id={fieldId}
            type={visible ? "text" : "password"}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || hint ? describedById : undefined}
            className={cn(
              "border-border-strong bg-surface text-text placeholder:text-text-muted h-12 w-full rounded-md border pr-12 pl-[17px] text-[15px] outline-none",
              "hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/60 transition-colors focus-visible:ring-2 focus-visible:outline-none",
              error && "border-danger focus-visible:border-danger",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="text-icon-muted hover:text-text focus-visible:ring-primary/60 absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            {visible ? (
              <EyeOff size={17} aria-hidden="true" />
            ) : (
              <Eye size={17} aria-hidden="true" />
            )}
          </button>
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
  },
);
