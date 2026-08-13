"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PasswordField } from "@/components/form/PasswordField";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { InlineError } from "@/components/feedback/InlineError";
import { useAuth } from "@/lib/auth";
import { applyApiErrors } from "@/lib/forms/applyApiErrors";

/**
 * Client validation mirrors the backend RegisterRequest where it can:
 * name/email required, password ≥ 12 with mixed case + a digit + a symbol.
 * The backend also rejects compromised passwords and passwords equal to the
 * name/email — those can only be checked server-side and surface as 422 field
 * errors mapped back onto this form.
 *
 * `password_confirmation` is a FRONTEND-ONLY guard (matched via `refine`): the
 * backend RegisterRequest carries no `confirmed` rule, so it is never sent.
 */
const schema = z
  .object({
    name: z.string().min(1, "Renseignez votre nom."),
    email: z
      .string()
      .min(1, "Renseignez votre e-mail.")
      .email("E-mail invalide."),
    password: z
      .string()
      .min(12, "12 caractères minimum.")
      .regex(/[a-z]/, "Ajoutez une minuscule.")
      .regex(/[A-Z]/, "Ajoutez une majuscule.")
      .regex(/\d/, "Ajoutez un chiffre.")
      .regex(/[^A-Za-z0-9]/, "Ajoutez un symbole."),
    password_confirmation: z.string(),
    referral_code: z
      .string()
      .max(32, "32 caractères maximum.")
      .optional()
      .or(z.literal("")),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "Les mots de passe ne correspondent pas.",
  });

type RegisterValues = z.infer<typeof schema>;

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<unknown>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      referral_code: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const referral = values.referral_code?.trim();
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        ...(referral ? { referral_code: referral } : {}),
      });
      router.replace(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      if (!applyApiErrors(error, setError)) setFormError(error);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <InlineError error={formError} />
      <TextField
        label="Nom complet"
        autoComplete="name"
        placeholder="Jean Dupont"
        error={errors.name?.message}
        {...register("name")}
      />
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
      <TextField
        label="Code de parrainage (optionnel)"
        autoComplete="off"
        placeholder="FP-XXXXXX"
        error={errors.referral_code?.message}
        {...register("referral_code")}
      />
      <div className="mt-2">
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Création…" : "Créer mon compte"}
        </Button>
      </div>
    </form>
  );
}
