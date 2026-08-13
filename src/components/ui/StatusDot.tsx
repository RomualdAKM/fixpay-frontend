import { cn } from "@/lib/utils";

interface StatusDotProps {
  size?: 6 | 7 | 8;
  /** Background color class; defaults to the green "online" dot. */
  colorClass?: string;
  /** 1px ring in the app background color (header bell badge). */
  ring?: boolean;
  className?: string;
}

/**
 * Small round status dot: 7px green (agent online), 8px blue (unread
 * notification), 6px blue + ring (header bell badge).
 */
export function StatusDot({
  size = 7,
  colorClass = "bg-success",
  ring = false,
  className,
}: StatusDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block shrink-0 rounded-full",
        colorClass,
        ring && "ring-bg ring-1",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
