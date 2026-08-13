import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * List section header: 15px title on the left, optional blue action
 * link ('Tout voir') on the right.
 */
export function SectionHeader({
  title,
  actionLabel,
  actionHref,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-text text-[15px] font-semibold">{title}</h2>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="text-primary text-[12px] font-medium"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
