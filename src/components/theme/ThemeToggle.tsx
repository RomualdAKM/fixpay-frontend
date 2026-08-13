"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme/ThemeProvider";
import { IconButton } from "@/components/ui/IconButton";

interface ThemeToggleProps {
  /** Matches the IconButton sizes used by the headers (34) and hero (34). */
  size?: 38 | 34 | 32 | 30;
  iconSize?: number;
  iconClass?: string;
  bordered?: boolean;
  bgClass?: string;
}

/**
 * Theme switch rendered as the design's existing "sun" action button.
 * The icon shows the theme you will switch TO — a sun while dark (exactly the
 * Figma mock), a moon while light.
 */
export function ThemeToggle({
  size = 34,
  iconSize = 17,
  iconClass = "text-primary-light",
  bordered,
  bgClass,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const goingLight = theme === "dark";

  return (
    <IconButton
      icon={goingLight ? Sun : Moon}
      size={size}
      iconSize={iconSize}
      iconClass={iconClass}
      bordered={bordered}
      bgClass={bgClass}
      onClick={toggleTheme}
      ariaLabel={
        goingLight ? "Passer en thème clair" : "Passer en thème sombre"
      }
    />
  );
}
