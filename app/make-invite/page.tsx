"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";

export default function MakeInvitePage() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  // Read window.location only after mount -- computing it during the
  // initial render would differ between the server (no window) and
  // client passes and trip a hydration mismatch.
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const link = (() => {
    if (!origin) return "";
    const url = new URL(origin);
    if (name.trim()) url.searchParams.set("name", name.trim());
    if (msg.trim()) url.searchParams.set("msg", msg.trim());
    return url.toString();
  })();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <main dir="rtl" className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 py-10 bg-warm-texture">
      <div className="w-full max-w-md rounded-3xl bg-[var(--color-surface-raised)] border border-[var(--color-border)]/40 shadow-lg p-6 flex flex-col gap-4">
        <div className="text-center">
          <h1 className="font-display text-xl font-bold text-[var(--color-text)]">
            إنشاء دعوة مخصصة
          </h1>
          <p className="font-body text-sm text-[var(--color-text-muted)] mt-1">
            اكتب اسم الضيف ورسالة خاصة، وانسخ الرابط لإرساله
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-body text-xs font-semibold text-[var(--color-text-muted)]">
            اسم الضيف (اختياري)
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: سارة"
            className="w-full rounded-xl bg-[var(--color-cream-50)] border-2 border-[var(--color-border)]/40 focus:border-[var(--color-primary)] outline-none px-4 py-2.5 font-body text-sm text-[var(--color-text)]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-body text-xs font-semibold text-[var(--color-text-muted)]">
            رسالة خاصة (اختياري)
          </label>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="مثال: أنتِ الأقرب لقلبنا، نتشرف بحضورك"
            rows={3}
            className="w-full rounded-xl bg-[var(--color-cream-50)] border-2 border-[var(--color-border)]/40 focus:border-[var(--color-primary)] outline-none px-4 py-2.5 font-body text-sm text-[var(--color-text)] resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-body text-xs font-semibold text-[var(--color-text-muted)]">
            الرابط الجاهز
          </label>
          <div dir="ltr" className="w-full rounded-xl bg-[var(--color-cream-100)] px-4 py-2.5 font-body text-xs text-[var(--color-text)] break-all">
            {link}
          </div>
        </div>

        <Button variant="primary" onClick={handleCopy} className="w-full">
          {copied ? "تم النسخ ✓" : "انسخ الرابط"}
        </Button>
      </div>
    </main>
  );
}
