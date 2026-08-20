"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthError } from "@/components/auth/AuthFeedback";
import { useResetPassword } from "@/lib/api/hooks";
import { applyApiErrors } from "@/lib/forms/applyApiErrors";

/**
 * Mirrors the backend ResetPasswordRequest password policy (≥ 12 with mixed
 * case, a digit and a symbol). The backend also rejects compromised passwords
 * and a password equal to the e-mail — those are server-only and surface as
 * 422 field errors mapped back onto this form. `password_confirmation` is a
 * frontend-only guard and is never sent.
 */
const schema = z
  .object({
    password: z
      .string()
      .min(12, "12 caractères minimum.")
      .regex(/[a-z]/, "Ajoutez une minuscule.")
      .regex(/[A-Z]/, "Ajoutez une majuscule.")
      .regex(/\d/, "Ajoutez un chiffre.")
      .regex(/[^A-Za-z0-9]/, "Ajoutez un symbole."),
    password_confirmation: z.string(),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "Les mots de passe ne correspondent pas.",
  });

type ResetValues = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const reset = useResetPassword();
  const [formError, setFormError] = useState<unknown>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await reset.mutateAsync({ token, email, password: values.password });
      setDone(true);
    } catch (error) {
      if (!applyApiErrors(error, setError)) setFormError(error);
    }
  });

  // Lien ouvert sans les paramètres attendus (copie partielle, lien tronqué).
  if (token === "" || email === "") {
    return (
      <div className="auth-form">
        <AuthError error="Ce lien de réinitialisation est incomplet ou invalide. Demandez-en un nouveau." />
        <Link href="/forgot-password" className="btn btn-primary btn-lg auth-submit">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-form">
        <div role="status" className="auth-ok">
          <CheckCircle size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
          <span>
            Votre mot de passe a été réinitialisé. Toutes vos sessions
            précédentes ont été déconnectées par sécurité.
          </span>
        </div>
        <Link href="/login" className="btn btn-primary btn-lg auth-submit">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="auth-form">
      <AuthError error={formError} />
      <p className="field-hint" style={{ marginTop: "-6px" }}>
        Nouveau mot de passe pour <strong>{email}</strong>.
      </p>
      <div className="field">
        <label htmlFor="reset-password">Nouveau mot de passe</label>
        <input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          placeholder="12 caractères minimum"
          className={errors.password ? "invalid" : undefined}
          {...register("password")}
        />
        {errors.password ? (
          <span className="field-err">{errors.password.message}</span>
        ) : (
          <span className="field-hint">
            12 caractères, avec majuscule, minuscule, chiffre et symbole.
          </span>
        )}
      </div>
      <div className="field">
        <label htmlFor="reset-password-confirm">Confirmer le mot de passe</label>
        <input
          id="reset-password-confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Retapez le mot de passe"
          className={errors.password_confirmation ? "invalid" : undefined}
          {...register("password_confirmation")}
        />
        {errors.password_confirmation && (
          <span className="field-err">
            {errors.password_confirmation.message}
          </span>
        )}
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-lg auth-submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Réinitialisation…" : "Réinitialiser mon mot de passe"}
      </button>
    </form>
  );
}
