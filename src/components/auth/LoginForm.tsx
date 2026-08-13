"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PasswordField } from "@/components/form/PasswordField";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { InlineError } from "@/components/feedback/InlineError";
import { useAuth } from "@/lib/auth";
import { applyApiErrors } from "@/lib/forms/applyApiErrors";

const schema = z.object({
  email: z.string().min(1, "Renseignez votre e-mail.").email("E-mail invalide."),
  password: z.string().min(1, "Renseignez votre mot de passe."),
});

type LoginValues = z.infer<typeof schema>;

/**
 * Safe internal redirect target from `?next=`, defaulting to the home tab.
 *
 * Only a same-origin absolute path is accepted. The value must start with a
 * single `/` followed by a character that is neither `/` nor `\`: this rejects
 * protocol-relative `//evil.com` AND the backslash-authority form `/\evil.com`
 * (the URL parser folds `\` into `/` for special schemes, so `/\evil.com`
 * resolves to the off-origin authority `evil.com`).
 */
export function safeNext(raw: string | null): string {
  if (raw && /^\/[^/\\]/.test(raw)) return raw;
  return "/";
}

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<unknown>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values);
      router.replace(safeNext(searchParams.get("next")));
    } catch (error) {
      if (!applyApiErrors(error, setError)) setFormError(error);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <InlineError error={formError} />
      <TextField
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="vous@exemple.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        label="Mot de passe"
        autoComplete="current-password"
        placeholder="••••••••••••"
        error={errors.password?.message}
        {...register("password")}
      />
      <div className="mt-2">
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Connexion…" : "Se connecter"}
        </Button>
      </div>
    </form>
  );
}
