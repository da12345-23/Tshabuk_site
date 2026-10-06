import { buildInviteLink, readInviteName } from "../lib/invite-link";

// Every guest name must (1) give a readable link -- Arabic letters as
// letters, not %D8%B3... codes -- and (2) land in the name field exactly as
// typed, however the link travels: opened as-is, or re-encoded once or
// twice by a messaging app on the way (which once showed guests
// "%D8%B1%D8%A9..." instead of their name).

const ORIGIN = "https://tshabuk.site";

const NAMES = [
  "سارة",
  "سارة أحمد",
  "عبد الله بن محمد",
  "أم محمد",
  "Dana",
  "Dana & Co #1",
  "أم+أب",
  "50%",
  "a/b\\c",
  "x?y=z",
  "O'Brien",
  "نور 🌸",
  "Ünïcødé",
  "  ‏محمد  علي‏ ",
];

// What the guest should see: no invisible marks, single spaces, trimmed.
const expected = (n: string) => n.replace(/[‎‏‪-‮⁦-⁩]/g, "").replace(/\s+/g, " ").trim();

// The ways a link can reach the site.
const journeys: Record<string, (link: string) => string> = {
  "opened as-is": (l) => l,
  "browser-normalised": (l) => new URL(l).href,
  "re-encoded by an app": (l) => encodeURI(l),
  "re-encoded twice": (l) => encodeURI(encodeURI(l)),
};

let failures = 0;
for (const name of NAMES) {
  const link = buildInviteLink(ORIGIN, name);

  if (/[؀-ۿ]/.test(name) && /%D[89]/i.test(link)) {
    failures++;
    console.log(`  unreadable link for ${JSON.stringify(name)}: ${link}`);
  }

  for (const [journey, travel] of Object.entries(journeys)) {
    const got = readInviteName(new URL(travel(link)).searchParams.get("name"));
    if (got !== expected(name)) {
      failures++;
      console.log(`  ${JSON.stringify(name)} ${journey}: got ${JSON.stringify(got)}`);
    }
  }
}

if (buildInviteLink(ORIGIN, "  ") !== `${ORIGIN}/`) {
  failures++;
  console.log("  an empty name should give the plain site link");
}

if (failures) {
  console.log(`${failures} invite-link problem(s)`);
  process.exit(1);
}
console.log(`all ${NAMES.length} names x ${Object.keys(journeys).length} journeys OK`);
