// Classic interlocking jigsaw piece geometry: each internal edge gets a
// randomized tab (bulging out) or blank (notched in), shared between the
// two neighboring pieces so they interlock exactly like a real puzzle.

export type EdgeSign = 1 | -1;

export type PieceGeometry = {
  row: number;
  col: number;
  /** Bounding box in board pixel space, including tab overflow. */
  bbox: { x: number; y: number; width: number; height: number };
  /** Closed path, in absolute board coordinates, for clipping/outline. */
  path: string;
  /** Target top-left position (bbox.x/y) once solved. */
  target: { x: number; y: number };
};

export type JigsawLayout = {
  rows: number;
  cols: number;
  boardWidth: number;
  boardHeight: number;
  pieces: PieceGeometry[];
};

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** SVG path fragment for one edge from (0,0) to (len,0), bumping in +y if sign=1. */
function edgeSegment(len: number, sign: EdgeSign, jitter: number): string {
  const bump = len * (0.16 + jitter * 0.03);
  const neckA = len * (0.36 + jitter * 0.02);
  const neckB = len * (0.64 - jitter * 0.02);
  const mid = len / 2;
  const s = sign;
  return [
    `L ${neckA} 0`,
    `C ${neckA} ${s * bump * 0.9}, ${mid - bump * 0.95} ${s * bump * 0.9}, ${mid - bump * 0.95} ${s * bump * 1.9}`,
    `C ${mid - bump * 0.95} ${s * bump * 2.9}, ${mid + bump * 0.95} ${s * bump * 2.9}, ${mid + bump * 0.95} ${s * bump * 1.9}`,
    `C ${mid + bump * 0.95} ${s * bump * 0.9}, ${neckB} ${s * bump * 0.9}, ${neckB} 0`,
    `L ${len} 0`,
  ].join(" ");
}

/** Transforms a local (0,0)->(len,0) edge path into absolute board coords. */
function placeEdge(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  sign: EdgeSign | 0,
  jitter: number
): string {
  const len = Math.hypot(x1 - x0, y1 - y0);
  if (sign === 0) return `L ${x1} ${y1}`;
  const angle = Math.atan2(y1 - y0, x1 - x0);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const local = edgeSegment(len, sign, jitter);
  // Rewrite each local coordinate pair through rotation+translation.
  const cmdRegex = /([LC])((?:\s*-?[\d.]+\s+-?[\d.]+,?)+)/g;
  let m: RegExpExecArray | null;
  const parts: string[] = [];
  while ((m = cmdRegex.exec(local))) {
    const cmd = m[1];
    const nums = m[2]
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const transformed = nums.map((pair) => {
      const [lx, ly] = pair.split(/\s+/).map(Number);
      const px = x0 + lx * cos - ly * sin;
      const py = y0 + lx * sin + ly * cos;
      return `${px.toFixed(2)} ${py.toFixed(2)}`;
    });
    parts.push(`${cmd} ${transformed.join(", ")}`);
  }
  return parts.join(" ");
}

/**
 * Builds a single decorative "puzzle piece" outline (rounded rect with
 * optional outward tabs / inward notches on each side) — used for the
 * invite card and other brand chrome, independent of the play grid.
 */
export function singlePiecePath(
  width: number,
  height: number,
  signs: { top?: EdgeSign | 0; right?: EdgeSign | 0; bottom?: EdgeSign | 0; left?: EdgeSign | 0 },
  jitter = 0.5,
  cornerRadius = 22
): string {
  const { top = 0, right = 0, bottom = 0, left = 0 } = signs;
  const r = Math.min(cornerRadius, width / 4, height / 4);
  const w = width;
  const h = height;

  let d = `M ${r} 0 `;
  d += placeEdge(r, 0, w - r, 0, top, jitter) + " ";
  d += `A ${r} ${r} 0 0 1 ${w} ${r} `;
  d += placeEdge(w, r, w, h - r, right, jitter) + " ";
  d += `A ${r} ${r} 0 0 1 ${w - r} ${h} `;
  d += placeEdge(w - r, h, r, h, bottom, jitter) + " ";
  d += `A ${r} ${r} 0 0 1 0 ${h - r} `;
  d += placeEdge(0, h - r, 0, r, left, jitter) + " ";
  d += `A ${r} ${r} 0 0 1 ${r} 0 `;
  d += "Z";
  return d;
}

export function generateJigsawLayout(
  boardWidth: number,
  boardHeight: number,
  rows: number,
  cols: number,
  seed = 42
): JigsawLayout {
  const rand = seededRandom(seed);
  const pw = boardWidth / cols;
  const ph = boardHeight / rows;

  // vSign[r][c] = sign of the vertical edge between piece(r,c) and piece(r,c+1)
  const vSign: EdgeSign[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols - 1 }, () => (rand() > 0.5 ? 1 : -1))
  );
  // hSign[r][c] = sign of the horizontal edge between piece(r,c) and piece(r+1,c)
  const hSign: EdgeSign[][] = Array.from({ length: rows - 1 }, () =>
    Array.from({ length: cols }, () => (rand() > 0.5 ? 1 : -1))
  );

  const pieces: PieceGeometry[] = [];
  const tabDepth = Math.min(pw, ph) * 0.42;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = c * pw;
      const y0 = r * ph;
      const x1 = x0 + pw;
      const y1 = y0 + ph;
      const jitter = rand();

      const topSign = r === 0 ? 0 : hSign[r - 1][c];
      const rightSign = c === cols - 1 ? 0 : vSign[r][c];
      const bottomSign = r === rows - 1 ? 0 : hSign[r][c];
      const leftSign = c === 0 ? 0 : vSign[r][c - 1];

      let d = `M ${x0} ${y0} `;
      d += placeEdge(x0, y0, x1, y0, topSign, jitter) + " ";
      d += placeEdge(x1, y0, x1, y1, rightSign as EdgeSign | 0, jitter) + " ";
      d += placeEdge(x1, y1, x0, y1, bottomSign ? ((-bottomSign) as EdgeSign) : 0, jitter) + " ";
      d += placeEdge(x0, y1, x0, y0, leftSign ? ((-leftSign) as EdgeSign) : 0, jitter) + " ";
      d += "Z";

      const bbox = {
        x: x0 - tabDepth,
        y: y0 - tabDepth,
        width: pw + tabDepth * 2,
        height: ph + tabDepth * 2,
      };

      pieces.push({
        row: r,
        col: c,
        bbox,
        path: d,
        target: { x: bbox.x, y: bbox.y },
      });
    }
  }

  return { rows, cols, boardWidth, boardHeight, pieces };
}

/** Slices a loaded image into per-piece canvases clipped to their jigsaw path. */
export function sliceImageToPieces(
  image: HTMLImageElement,
  layout: JigsawLayout
): Map<string, HTMLCanvasElement> {
  const full = document.createElement("canvas");
  full.width = layout.boardWidth;
  full.height = layout.boardHeight;
  const fullCtx = full.getContext("2d")!;
  fullCtx.drawImage(image, 0, 0, layout.boardWidth, layout.boardHeight);

  const result = new Map<string, HTMLCanvasElement>();

  for (const piece of layout.pieces) {
    const canvas = document.createElement("canvas");
    canvas.width = piece.bbox.width;
    canvas.height = piece.bbox.height;
    const ctx = canvas.getContext("2d")!;
    ctx.save();
    ctx.translate(-piece.bbox.x, -piece.bbox.y);
    const clip = new Path2D(piece.path);
    ctx.clip(clip);
    ctx.drawImage(full, 0, 0);
    // Outline stroke to echo the logo's hand-drawn piece borders.
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(43, 35, 32, 0.55)";
    ctx.stroke(clip);
    ctx.restore();
    result.set(`${piece.row}-${piece.col}`, canvas);
  }

  return result;
}
