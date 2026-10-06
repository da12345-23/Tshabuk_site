"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";

// Builds the name part of the link so it stays readable -- Arabic letters
// are kept as they are (tshabuk.site/?name=سارة) instead of the browser's
// %D8%B3... codes. Only characters that would break the link are escaped,
// and spaces become "+" (read back as spaces). Invisible direction marks
// that phone keyboards sometimes add are dropped.
function readableName(value: string) {
  return value
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[%&#+?=/\\]/g, (c) => encodeURIComponent(c))
    .replace(/ /g, "+");
}

export default function MakeInvitePage() {
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  // Read window.location only after mount -- computing it during the
  // initial render would differ between the server (no window) and
  // client passes and trip a hydration mismatch.
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const guest = readableName(name);
  const link = origin ? `${origin}/${guest ? `?name=${guest}` : ""}` : "";

  async function handleCopy() {
    if (!link) return;
    let ok = false;
    try {
      await navigator.clipboard.writeText(link);
      ok = true;
    } catch {
      // Some phones and in-app browsers block the clipboard API -- fall
      // back to the older copy command so the button still works there.
      const area = document.createElement("textarea");
      area.value = link;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      area.remove();
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
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
            اكتب اسم الضيف وانسخ الرابط لإرساله
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
            الرابط الجاهز
          </label>
          <div dir="ltr" className="w-full rounded-xl bg-[var(--color-cream-100)] px-4 py-2.5 font-body text-xs text-[var(--color-text)] break-all select-all">
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
