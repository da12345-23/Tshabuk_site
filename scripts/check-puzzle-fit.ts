import { generateJigsawLayout } from "../lib/jigsaw";

// Every interior edge is drawn by two neighbouring pieces; their bezier
// curves must be identical (one reversed). Any curve that doesn't pair up
// means two pieces won't fit together exactly.
function unmatchedFor(rows: number, cols: number, seed: number) {
  const L = generateJigsawLayout(300, 300, rows, cols, seed);
  const counts = new Map<string, number>();
  for (const p of L.pieces) {
    const toks = p.path.replace(/,/g, " ").replace(/[MLCZ]/g, (m) => ` ${m} `).split(/\s+/).filter(Boolean);
    let cmd = "", last = [0, 0]; const nums: number[] = [];
    for (const t of toks) {
      if ("MLCZ".includes(t)) { cmd = t; nums.length = 0; continue; }
      nums.push(parseFloat(t));
      if ((cmd === "M" || cmd === "L") && nums.length === 2) { last = [...nums]; nums.length = 0; }
      else if (cmd === "C" && nums.length === 6) {
        const s = [...last, ...nums]; last = [nums[4], nums[5]]; nums.length = 0;
        const f = s.map((n) => n.toFixed(1)).join(",");
        const r = [s[6], s[7], s[4], s[5], s[2], s[3], s[0], s[1]].map((n) => n.toFixed(1)).join(",");
        const k = f < r ? f : r;
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
    }
  }
  return [...counts.values()].filter((c) => c !== 2).length;
}

let bad = 0;
for (const [r, c, seed] of [[3, 3, 7], [3, 3, 1], [4, 4, 99]] as const) {
  const n = unmatchedFor(r, c, seed);
  console.log(`${r}x${c} seed ${seed}: ${n === 0 ? "OK" : `${n} edges DON'T FIT`}`);
  bad += n;
}
process.exit(bad ? 1 : 0);
