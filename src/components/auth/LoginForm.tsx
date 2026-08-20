"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthError } from "@/components/auth/AuthFeedback";
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
    <form onSubmit={onSubmit} noValidate className="auth-form">
      <AuthError error={formError} />

      <div className="field">
        <label htmlFor="login-email">Adresse e-mail</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          className={errors.email ? "invalid" : undefined}
          {...register("email")}
        />
        {errors.email && <span className="field-err">{errors.email.message}</span>}
      </div>

      <div className="field">
        <div className="field-head">
          <label htmlFor="login-password">Mot de passe</label>
          <Link href="/forgot-password" className="field-link">
            Mot de passe oublié ?
          </Link>
        </div>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••••••"
          className={errors.password ? "invalid" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <span className="field-err">{errors.password.message}</span>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-lg auth-submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
