"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { useLocale } from "@/lib/locale-context";
import { Button } from "./Button";

export function NameEntry({
  onStart,
  initialName = "",
}: {
  onStart: (name: string) => void;
  initialName?: string;
}) {
  const { t } = useLocale();
  const [name, setName] = useState(initialName);
  const [shake, setShake] = useState(0);

  // initialName arrives a tick after mount (read from the URL in the
  // parent, client-side only, to avoid an SSR/client markup mismatch).
  useEffect(() => {
    if (initialName) setName(initialName);
  }, [initialName]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setShake((s) => s + 1);
      return;
    }
    onStart(trimmed);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center text-center gap-6 max-w-sm mx-auto px-6"
    >
      <motion.div
        animate={{ rotate: [0, -6, 6, -4, 0], y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 relative drop-shadow-lg"
      >
        <Image src="/images/brand/logo-clean-t.png" alt={t.appName} fill className="object-contain" priority />
      </motion.div>

      <div>
        <h1 className="font-display text-3xl font-bold text-[var(--color-text)]">
          {t.landing.title}
        </h1>
        <p className="font-body text-sm text-[var(--color-text-muted)] mt-2">
          {t.landing.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-3">
        <motion.div
          animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.45 }}
          className="w-full"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.landing.namePlaceholder}
            aria-label={t.landing.nameLabel}
            className="w-full rounded-2xl bg-[var(--color-surface-raised)] border-2 border-[var(--color-border)]/40 focus:border-[var(--color-primary)] outline-none px-5 py-3.5 text-center font-body text-base text-[var(--color-text)] shadow-sm transition-colors duration-200 placeholder:text-[var(--color-text-muted)]/70"
          />
        </motion.div>

        <Button type="submit" variant="primary" className="w-full">
          {t.landing.startButton}
        </Button>
      </form>
    </motion.div>
  );
}
