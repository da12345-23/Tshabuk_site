// Personal invite links: tshabuk.site/?name=<guest name>.
//
// Both directions live here so they can't drift apart, and both are checked
// by scripts/check-invite-links.ts (part of `npm run qa`) -- an Arabic name
// once reached guests as "%D8%B1%D8%A9..." in the name field.

// Invisible direction marks that phone keyboards sometimes add to Arabic.
const BIDI_MARKS = /[‎‏‪-‮⁦-⁩]/g;

/** A name as a guest should see it: no invisible marks, single spaces. */
function tidy(name: string) {
  return name.replace(BIDI_MARKS, "").replace(/\s+/g, " ").trim();
}

/**
 * The link for a guest, kept readable: Arabic letters stay as they are
 * (…/?name=سارة+أحمد) instead of the browser's %D8%B3… codes. Only
 * characters that would break the link are escaped; spaces become "+",
 * which the site reads back as spaces.
 */
export function buildInviteLink(origin: string, name: string) {
  const guest = tidy(name)
    .replace(/[%&#+?=/\\]/g, (c) => encodeURIComponent(c))
    .replace(/ /g, "+");
  return `${origin}/${guest ? `?name=${guest}` : ""}`;
}

/**
 * The guest's name from a link's ?name= value (already decoded once by
 * URLSearchParams). Messaging apps sometimes encode a shared link again,
 * so undo any leftover encoding -- a few layers at most.
 */
export function readInviteName(raw: string | null) {
  let name = raw ?? "";
  for (let i = 0; i < 3 && /%[0-9a-f]{2}/i.test(name); i++) {
    try {
      const decoded = decodeURIComponent(name);
      if (decoded === name) break;
      name = decoded;
    } catch {
      break;
    }
  }
  return tidy(name);
}
