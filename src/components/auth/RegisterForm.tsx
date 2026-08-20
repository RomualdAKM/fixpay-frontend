"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthError } from "@/components/auth/AuthFeedback";
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
  // `RegisterFormFields` lit `?ref=` via useSearchParams : cet appel doit vivre
  // sous une frontière Suspense pour que /register reste prérendu statiquement.
  return (
    <Suspense fallback={null}>
      <RegisterFormFields />
    </Suspense>
  );
}

function RegisterFormFields() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<unknown>(null);

  // Code de parrainage transmis par un lien « …/r/{code} » (route src/app/r/[code]),
  // qui redirige vers /register?ref={code}. Le champ reste librement éditable.
  const searchParams = useSearchParams();
  const referralFromLink = searchParams.get("ref")?.trim() ?? "";

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
      referral_code: referralFromLink,
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
    <form onSubmit={onSubmit} noValidate className="auth-form">
      <AuthError error={formError} />

      <div className="field">
        <label htmlFor="reg-name">Nom complet</label>
        <input
          id="reg-name"
          autoComplete="name"
          placeholder="Jean Dupont"
          className={errors.name ? "invalid" : undefined}
          {...register("name")}
        />
        {errors.name && <span className="field-err">{errors.name.message}</span>}
      </div>

      <div className="field">
        <label htmlFor="reg-email">Adresse e-mail</label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          className={errors.email ? "invalid" : undefined}
          {...register("email")}
        />
        {errors.email && <span className="field-err">{errors.email.message}</span>}
      </div>

      <div className="field">
        <label htmlFor="reg-password">Mot de passe</label>
        <input
          id="reg-password"
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
        <label htmlFor="reg-password-confirm">Confirmer le mot de passe</label>
        <input
          id="reg-password-confirm"
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

      <div className="field">
        <label htmlFor="reg-referral">Code de parrainage (optionnel)</label>
        <input
          id="reg-referral"
          autoComplete="off"
          placeholder="FP-XXXXXX"
          className={errors.referral_code ? "invalid" : undefined}
          {...register("referral_code")}
        />
        {errors.referral_code && (
          <span className="field-err">{errors.referral_code.message}</span>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-lg auth-submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Création…" : "Créer mon compte"}
      </button>
    </form>
  );
}
