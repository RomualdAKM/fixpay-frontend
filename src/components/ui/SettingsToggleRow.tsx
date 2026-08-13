import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/Toggle";

interface SettingsToggleRowProps {
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  /** 1px hairline under the row. */
  divider?: boolean;
}

/**
 * Settings row laid directly on the page background (no card):
 * title + subtitle on the left, Toggle on the right.
 */
export function SettingsToggleRow({
  title,
  subtitle,
  checked,
  onChange,
  divider = false,
}: SettingsToggleRowProps) {
  return (
    <div
      className={cn(
        "flex h-[69px] items-center justify-between",
        divider && "border-border border-b",
      )}
    >
      <div>
        <p className="text-text text-[14px] font-medium">{title}</p>
        <p className="text-text-muted mt-[2px] text-[12px]">{subtitle}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}
