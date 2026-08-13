"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PinField } from "@/components/form/PinField";
import { Button } from "@/components/ui/Button";
import { Numpad } from "@/components/ui/Numpad";
import { InlineError } from "@/components/feedback/InlineError";
import { useSetPin } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth";

const MIN_LENGTH = 4;
const MAX_LENGTH = 6;

/** Keep only digits and never exceed the max PIN length. */
function appendDigits(current: string, keys: string): string {
  const next = (current + keys).replace(/\D/g, "");
  return next.slice(0, MAX_LENGTH);
}

/**
 * Define the transactional PIN (4–6 digits) via the shared Numpad, in two
 * steps: enter, then confirm. On a match it calls POST /api/pin and returns to
 * the app. The PIN only ever lives in local state during entry.
 */
export function PinSetView() {
  const router = useRouter();
  const { refetch } = useAuth();
  const setPin = useSetPin();

  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [firstPin, setFirstPin] = useState("");
  const [pin, setPin_] = useState("");
  const [mismatch, setMismatch] = useState(false);

  const onKey = (key: string) => {
    setMismatch(false);
    setPin_((value) => appendDigits(value, key));
  };
  const onDelete = () => {
    setMismatch(false);
    setPin_((value) => value.slice(0, -1));
  };

  const canContinue = pin.length >= MIN_LENGTH;

  const advance = () => {
    if (!canContinue) return;
    if (step === "enter") {
      setFirstPin(pin);
      setPin_("");
      setStep("confirm");
      return;
    }
    if (pin !== firstPin) {
      setMismatch(true);
      setPin_("");
      return;
    }
    setPin.mutate(pin, {
      onSuccess: async () => {
        await refetch();
        router.replace("/");
      },
    });
  };

  const heading = step === "enter" ? "Choisissez un code PIN" : "Confirmez le code";
  const help =
    step === "enter"
      ? "4 à 6 chiffres. Il vous sera demandé pour chaque opération sensible."
      : "Saisissez à nouveau le code pour le confirmer.";

  return (
    <div className="flex flex-col">
      <div className="text-center">
        <h2 className="text-text text-[18px] leading-[24px] font-semibold">
          {heading}
        </h2>
        <p className="text-text-secondary mx-auto mt-2 max-w-[300px] text-[13.5px] leading-[19px]">
          {help}
        </p>
      </div>

      <PinField
        value={pin}
        length={MAX_LENGTH}
        invalid={mismatch}
        className="mt-8"
      />

      {mismatch && (
        <p className="text-danger mt-4 text-center text-[13px]" aria-live="polite">
          Les codes ne correspondent pas. Réessayez.
        </p>
      )}

      {setPin.isError && <InlineError error={setPin.error} className="mt-4" />}

      <div className="mt-8">
        <Numpad onKey={onKey} onDelete={onDelete} />
      </div>

      <div className="mt-8">
        <Button
          variant="primary"
          onClick={advance}
          disabled={!canContinue || setPin.isPending}
        >
          {step === "enter"
            ? "Continuer"
            : setPin.isPending
              ? "Enregistrement…"
              : "Définir le code"}
        </Button>
      </div>
    </div>
  );
}
