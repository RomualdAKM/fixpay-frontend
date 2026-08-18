"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { InlineError } from "@/components/feedback/InlineError";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
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
  // que l'adresse existe ou non (anti-énumération), donc l'écran ne confirme
  // jamais l'existence d'un compte.
  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <div
          role="status"
          className="border-success-border bg-success-surface flex items-start gap-2.5 rounded-md border px-3.5 py-3"
        >
          <MailCheck
            size={16}
            strokeWidth={2}
            absoluteStrokeWidth
            aria-hidden="true"
            className="text-success mt-[1px] shrink-0"
          />
          <p className="text-success text-[13px] leading-[18px]">
            Si un compte est associé à cette adresse, un e-mail contenant un lien
            de réinitialisation vient d’être envoyé. Pensez à vérifier vos spams.
            Le lien est valable 60 minutes.
          </p>
        </div>
        <Button variant="glass" href="/login">
          Retour à la connexion
        </Button>
      </div>
    );
  }

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
      <div className="mt-2">
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Envoi…" : "Envoyer le lien"}
        </Button>
      </div>
    </form>
  );
}
