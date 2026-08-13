interface AvatarProps {
  initial: string;
  size?: number;
}

/**
 * Round initial avatar (profile). Le remplissage et l'anneau passent par les
 * tokens de surface (l'anneau était un `rgb(255 255 255 / 0.28)` en dur) ;
 * l'avatar vit dans un sous-arbre `data-theme="dark"`, les tokens y résolvent
 * donc bien sur les valeurs sombres.
 */
export function Avatar({ initial, size = 68 }: AvatarProps) {
  return (
    <div
      className="bg-surface-4 ring-surface-5 flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-[3px]"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * (24 / 68)),
      }}
    >
      {initial}
    </div>
  );
}
