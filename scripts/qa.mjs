// Run with: npm run qa            (checks the live site)
//           npm run qa -- http://localhost:3000   (checks another URL)
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const base = process.argv[2] ?? "https://tshabuk.site";
let failed = 0;
const ok = (m) => console.log(`  PASS  ${m}`);
const bad = (m) => { failed++; console.log(`  FAIL  ${m}`); };
const run = (label, cmd) => {
  try { execSync(cmd, { stdio: "pipe" }); ok(label); }
  catch (e) { bad(label + "\n" + String(e.stdout ?? e.message).split("\n").slice(0, 8).join("\n")); }
};

console.log("Code checks");
run("TypeScript compiles", "npx tsc --noEmit");
run("Puzzle pieces fit exactly", "npx tsx scripts/check-puzzle-fit.ts");
run("Invite links keep names readable and intact", "npx tsx scripts/check-invite-links.ts");

console.log("Assets");
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const src = walk("app").concat(walk("components"), walk("lib")).filter((f) => /\.(tsx?|css)$/.test(f));
const missing = new Set();
for (const f of src) for (const m of readFileSync(f, "utf8").matchAll(/["'`](\/images\/[^"'`\s)]+\.(?:png|jpg|webp|svg))["'`]/g))
  if (!existsSync(join("public", m[1]))) missing.add(m[1]);
missing.size ? bad(`missing image files: ${[...missing].join(", ")}`) : ok("every referenced /images/... file exists");

console.log(`Live site (${base})`);
for (const path of ["/", "/leaderboard", "/make-invite"]) {
  try { const r = await fetch(base + path); r.ok ? ok(`${path} -> ${r.status}`) : bad(`${path} -> ${r.status}`); }
  catch (e) { bad(`${path} unreachable: ${e.message}`); }
}
try {
  const r = await fetch(base + "/api/leaderboard", { cache: "no-store" });
  const j = await r.json();
  r.ok && Array.isArray(j.entries) ? ok(`leaderboard API works (${j.entries.length} entries, backend: ${j.backend})`) : bad("leaderboard API returned an unexpected response");
  if (base.startsWith("https://") && j.backend !== "supabase") bad("live leaderboard is NOT using Supabase (scores would not be shared)");
} catch (e) { bad(`leaderboard API failed: ${e.message}`); }
try {
  const r = await fetch(base + "/api/leaderboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "", timeMs: -5 }) });
  r.status === 400 ? ok("API rejects invalid scores") : bad(`API accepted an invalid score (status ${r.status})`);
} catch (e) { bad(`validation check failed: ${e.message}`); }

console.log(failed ? `\n${failed} problem(s) found.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
