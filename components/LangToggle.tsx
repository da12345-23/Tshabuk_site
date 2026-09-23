"use client";

import { motion } from "motion/react";
import { useLocale } from "@/lib/locale-context";

export function LangToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      className={`font-body text-xs font-semibold rounded-full px-3.5 py-1.5 bg-[var(--color-surface-raised)]/80 backdrop-blur border border-[var(--color-border)]/40 text-[var(--color-text)] shadow-sm ${className}`}
    >
      {t.langToggle}
    </motion.button>
  );
}
