"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { InlineError } from "@/components/feedback/InlineError";
import { PasswordField } from "@/components/form/PasswordField";
import { Button } from "@/components/ui/Button";
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

  // Lien ouvert sans les paramètres attendus (copie partielle, lien tronqué) :
  // on n'affiche pas le formulaire, on renvoie vers une nouvelle demande.
  if (token === "" || email === "") {
    return (
      <div className="flex flex-col gap-4">
        <InlineError error="Ce lien de réinitialisation est incomplet ou invalide. Demandez-en un nouveau." />
        <Button variant="primary" href="/forgot-password">
          Demander un nouveau lien
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <div
          role="status"
          className="border-success-border bg-success-surface flex items-start gap-2.5 rounded-md border px-3.5 py-3"
        >
          <CheckCircle
            size={16}
            strokeWidth={2}
            absoluteStrokeWidth
            aria-hidden="true"
            className="text-success mt-[1px] shrink-0"
          />
          <p className="text-success text-[13px] leading-[18px]">
            Votre mot de passe a été réinitialisé. Toutes vos sessions
            précédentes ont été déconnectées par sécurité.
          </p>
        </div>
        <Button variant="primary" href="/login">
          Se connecter
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <InlineError error={formError} />
      <p className="text-text-secondary -mt-1 text-[13px] leading-[18px]">
        Nouveau mot de passe pour <span className="text-text font-medium">{email}</span>.
      </p>
      <PasswordField
        label="Nouveau mot de passe"
        autoComplete="new-password"
        placeholder="12 caractères minimum"
        hint="12 caractères, avec majuscule, minuscule, chiffre et symbole."
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordField
        label="Confirmer le mot de passe"
        autoComplete="new-password"
        placeholder="Retapez le mot de passe"
        error={errors.password_confirmation?.message}
        {...register("password_confirmation")}
      />
      <div className="mt-2">
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Réinitialisation…" : "Réinitialiser mon mot de passe"}
        </Button>
      </div>
    </form>
  );
}
