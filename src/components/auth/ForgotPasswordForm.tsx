"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthError } from "@/components/auth/AuthFeedback";
import { useForgotPassword } from "@/lib/api/hooks";
import { applyApiErrors } from "@/lib/forms/applyApiErrors";

const schema = z.object({
  email: z.string().min(1, "Renseignez votre e-mail.").email("E-mail invalide."),
});

type ForgotValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const [formError, setFormError] = useState<unknown>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await forgot.mutateAsync(values.email);
      setSent(true);
    } catch (error) {
      if (!applyApiErrors(error, setError)) setFormError(error);
    }
  });

  // Confirmation VOLONTAIREMENT neutre : le backend répond de la même manière
  // que l'adresse existe ou non (anti-énumération).
  if (sent) {
    return (
      <div className="auth-form">
        <div role="status" className="auth-ok">
          <MailCheck size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
          <span>
            Si un compte est associé à cette adresse, un e-mail contenant un lien
            de réinitialisation vient d’être envoyé. Pensez à vérifier vos spams.
            Le lien est valable 60 minutes.
          </span>
        </div>
        <Link href="/login" className="btn btn-ghost btn-lg auth-submit">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="auth-form">
      <AuthError error={formError} />
      <div className="field">
        <label htmlFor="forgot-email">Adresse e-mail</label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          className={errors.email ? "invalid" : undefined}
          {...register("email")}
        />
        {errors.email && <span className="field-err">{errors.email.message}</span>}
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-lg auth-submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Envoi…" : "Envoyer le lien"}
      </button>
    </form>
  );
}
