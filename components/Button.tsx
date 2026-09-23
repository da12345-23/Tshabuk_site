"use client";

import { motion } from "motion/react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] shadow-md shadow-[var(--color-primary)]/20 hover:bg-[var(--color-primary-hover)]",
  secondary:
    "bg-[var(--color-secondary)] text-[var(--color-text-on-primary)] shadow-md shadow-[var(--color-secondary)]/20 hover:bg-[var(--color-secondary-hover)]",
  ghost:
    "bg-[var(--color-surface-raised)] text-[var(--color-text)] border border-[var(--color-border)]/50 hover:border-[var(--color-primary)]/50",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <motion.button
      whileHover={{ scale: 1.035, y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={`font-display font-semibold rounded-full px-6 py-3 text-[15px] transition-colors duration-200 ${styles[variant]} ${className}`}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
}
