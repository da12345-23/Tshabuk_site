// The "Save as image" photo, drawn straight onto a <canvas>.
//
// It used to go through html-to-image, which has the browser render the
// page into an SVG <foreignObject> snapshot. Safari -- and so every browser
// on iPhone -- does that badly: guests got photos without the logo,
// mascots or puzzle pieces, zoomed in and cropped, with emoji turned into
// "�". Canvas drawing has none of those problems on any phone.
//
// Nothing is laid out twice: the hidden export copy of the invite (see
// app/page.tsx) is already laid out by the browser, so this reads where
// everything ended up -- boxes, pictures, icons and every line of text --
// and paints the same thing, in the same order.

type Box = { x: number; y: number; w: number; h: number };

const PIXEL_RATIO = 2;

function px(v: string) {
  return parseFloat(v) || 0;
}

function isTransparent(color: string) {
  return !color || color === "transparent" || /^rgba\(.*,\s*0\)$/.test(color) || /\/\s*0\)$/.test(color);
}

/** Split a CSS list on top-level commas (not the ones inside rgb(...)). */
function splitTop(value: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i++) {
    const c = value[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === "," && depth === 0) {
      parts.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(value.slice(start).trim());
  return parts.filter(Boolean);
}

/** A color at the start of a computed-style token list, and the rest. */
function takeColor(value: string): [string, string] {
  const m = value.match(/^((?:rgba?|hsla?|oklab|oklch|lab|lch|color)\([^)]*\)|#[0-9a-f]+|[a-z]+)\s*(.*)$/i);
  return m ? [m[1], m[2]] : ["", value];
}

// ---------------------------------------------------------------- geometry

/** Untransformed layout box relative to the frame (ignores CSS transforms). */
function layoutBox(el: Element, frame: HTMLElement): Box {
  if (el instanceof HTMLElement) {
    let x = 0;
    let y = 0;
    let node: HTMLElement | null = el;
    while (node && node !== frame) {
      x += node.offsetLeft + (node !== el ? node.clientLeft : 0);
      y += node.offsetTop + (node !== el ? node.clientTop : 0);
      node = node.offsetParent as HTMLElement | null;
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  }
  const r = el.getBoundingClientRect();
  const f = frame.getBoundingClientRect();
  return { x: r.left - f.left, y: r.top - f.top, w: r.width, h: r.height };
}

/** The element's CSS transforms (its own and its ancestors') as one matrix. */
function transformOf(el: Element, frame: HTMLElement) {
  const chain: Element[] = [];
  for (let n: Element | null = el; n && n !== frame; n = n.parentElement) chain.unshift(n);
  let m = new DOMMatrix();
  for (const node of chain) {
    if (!(node instanceof HTMLElement)) continue;
    const cs = getComputedStyle(node);
    if (!cs.transform || cs.transform === "none") continue;
    const box = layoutBox(node, frame);
    const [ox, oy] = cs.transformOrigin.split(" ").map(px);
    m = m
      .translate(box.x + ox, box.y + oy)
      .multiply(new DOMMatrix(cs.transform))
      .translate(-(box.x + ox), -(box.y + oy));
  }
  return m;
}

function opacityOf(el: Element, frame: HTMLElement) {
  let a = 1;
  for (let n: Element | null = el; n && n !== frame.parentElement; n = n.parentElement) {
    a *= parseFloat(getComputedStyle(n).opacity);
  }
  return a;
}

function roundRectPath(ctx: CanvasRenderingContext2D, b: Box, cs: CSSStyleDeclaration, grow = 0) {
  const max = Math.min(b.w, b.h) / 2 + grow;
  const r = (v: string) => Math.max(0, Math.min(px(v) + (px(v) > 0 ? grow : 0), max));
  const tl = r(cs.borderTopLeftRadius);
  const tr = r(cs.borderTopRightRadius);
  const br = r(cs.borderBottomRightRadius);
  const bl = r(cs.borderBottomLeftRadius);
  const x = b.x - grow;
  const y = b.y - grow;
  const w = b.w + grow * 2;
  const h = b.h + grow * 2;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h);
  ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl);
  ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
}

// ------------------------------------------------------------- backgrounds

function linearGradient(ctx: CanvasRenderingContext2D, value: string, b: Box) {
  const inner = value.slice(value.indexOf("(") + 1, value.lastIndexOf(")"));
  const parts = splitTop(inner);
  let angle = 180;
  if (/deg$/.test(parts[0])) angle = parseFloat(parts.shift()!);
  else if (/^to /.test(parts[0])) {
    const dir = parts.shift()!;
    angle = dir.includes("right") ? 90 : dir.includes("left") ? 270 : dir.includes("top") ? 0 : 180;
  }
  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const len = Math.abs(b.w * dx) + Math.abs(b.h * dy);
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const g = ctx.createLinearGradient(cx - (dx * len) / 2, cy - (dy * len) / 2, cx + (dx * len) / 2, cy + (dy * len) / 2);
  parts.forEach((stop, i) => {
    const [color, rest] = takeColor(stop);
    const at = /%/.test(rest) ? parseFloat(rest) / 100 : i / Math.max(1, parts.length - 1);
    try {
      g.addColorStop(Math.min(1, Math.max(0, at)), color);
    } catch {
      // unparseable stop -- skip it
    }
  });
  return g;
}

type Shadow = { color: string; x: number; y: number; blur: number; spread: number; inset: boolean };

function parseShadows(value: string): Shadow[] {
  if (!value || value === "none") return [];
  return splitTop(value).map((layer) => {
    const inset = /\binset\b/.test(layer);
    const [color, rest] = takeColor(layer.replace(/\binset\b/, "").trim());
    const [x = 0, y = 0, blur = 0, spread = 0] = rest.split(/\s+/).map(px);
    return { color, x, y, blur, spread, inset };
  });
}

function paintBox(ctx: CanvasRenderingContext2D, el: HTMLElement, cs: CSSStyleDeclaration, b: Box) {
  const shadows = parseShadows(cs.boxShadow).filter((s) => !s.inset && !isTransparent(s.color));
  const bg = cs.backgroundColor;
  const image = cs.backgroundImage;
  const hasGradient = image && image.startsWith("linear-gradient");
  const borderW = px(cs.borderTopWidth);
  const hasBorder = borderW > 0 && cs.borderTopStyle !== "none" && !isTransparent(cs.borderTopColor);
  if (!shadows.length && isTransparent(bg) && !hasGradient && !hasBorder) return;

  // Outer shadows and rings, back to front.
  for (const s of [...shadows].reverse()) {
    ctx.save();
    if (s.blur === 0) {
      roundRectPath(ctx, { ...b, x: b.x + s.x, y: b.y + s.y }, cs, s.spread);
      ctx.fillStyle = s.color;
      ctx.fill();
    } else {
      // Draw the shape far off-canvas and let only its shadow land here.
      const far = 100000;
      roundRectPath(ctx, { ...b, x: b.x - far }, cs, s.spread);
      ctx.shadowColor = s.color;
      ctx.shadowBlur = s.blur * PIXEL_RATIO;
      ctx.shadowOffsetX = (far + s.x) * PIXEL_RATIO;
      ctx.shadowOffsetY = s.y * PIXEL_RATIO;
      ctx.fillStyle = "#000";
      ctx.fill();
    }
    ctx.restore();
  }

  roundRectPath(ctx, b, cs);
  if (!isTransparent(bg)) {
    ctx.fillStyle = bg;
    ctx.fill();
  }
  if (hasGradient) {
    ctx.fillStyle = linearGradient(ctx, image, b);
    ctx.fill();
  }
  if (hasBorder) {
    ctx.save();
    roundRectPath(ctx, { x: b.x + borderW / 2, y: b.y + borderW / 2, w: b.w - borderW, h: b.h - borderW }, cs);
    ctx.lineWidth = borderW;
    ctx.strokeStyle = cs.borderTopColor;
    if (cs.borderTopStyle === "dashed") ctx.setLineDash([borderW * 3, borderW * 2]);
    ctx.stroke();
    ctx.restore();
  }
}

// ------------------------------------------------------------------ images

function paintImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cs: CSSStyleDeclaration, b: Box) {
  if (!img.complete || !img.naturalWidth) return;
  ctx.save();
  const shadow = cs.filter.match(/drop-shadow\((.*)\)/);
  if (shadow) {
    const [color, rest] = takeColor(shadow[1].trim());
    const [x = 0, y = 0, blur = 0] = rest.split(/\s+/).map(px);
    ctx.shadowColor = color;
    ctx.shadowOffsetX = x * PIXEL_RATIO;
    ctx.shadowOffsetY = y * PIXEL_RATIO;
    ctx.shadowBlur = blur * PIXEL_RATIO;
  }
  // object-fit: contain keeps the picture's own proportions inside the box.
  let { x, y, w, h } = b;
  if (cs.objectFit === "contain") {
    const s = Math.min(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * s;
    const dh = img.naturalHeight * s;
    x += (w - dw) / 2;
    y += (h - dh) / 2;
    w = dw;
    h = dh;
  }
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

/** Inline line icons (stroke-only SVG on a 24-unit grid), as canvas paths. */
function paintIcon(ctx: CanvasRenderingContext2D, svg: SVGSVGElement, b: Box) {
  const cs = getComputedStyle(svg);
  const vb = svg.viewBox.baseVal;
  const scale = vb && vb.width ? b.w / vb.width : 1;
  const color = cs.color;
  const stroke = (svg.getAttribute("stroke") || "currentColor").replace("currentColor", color);
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.scale(scale, scale);
  ctx.lineWidth = px(svg.getAttribute("stroke-width") || "2");
  ctx.lineCap = (svg.getAttribute("stroke-linecap") as CanvasLineCap) || "butt";
  ctx.lineJoin = "round";
  ctx.strokeStyle = stroke;
  for (const shape of Array.from(svg.children)) {
    const a = (n: string) => px(shape.getAttribute(n) || "0");
    let path: Path2D | null = null;
    if (shape.tagName === "path") path = new Path2D(shape.getAttribute("d") || "");
    else if (shape.tagName === "circle") {
      path = new Path2D();
      path.arc(a("cx"), a("cy"), a("r"), 0, Math.PI * 2);
    } else if (shape.tagName === "rect") {
      const r = a("rx");
      const [x, y, w, h] = [a("x"), a("y"), a("width"), a("height")];
      path = new Path2D();
      path.moveTo(x + r, y);
      path.arcTo(x + w, y, x + w, y + h, r);
      path.arcTo(x + w, y + h, x, y + h, r);
      path.arcTo(x, y + h, x, y, r);
      path.arcTo(x, y, x + w, y, r);
      path.closePath();
    }
    if (path) ctx.stroke(path);
  }
  ctx.restore();
}

// -------------------------------------------------------------------- text

/** Draw a text node line by line, exactly where the browser laid it out. */
function paintText(ctx: CanvasRenderingContext2D, node: Text, frame: HTMLElement) {
  const text = node.data;
  if (!text.trim()) return;
  const parent = node.parentElement!;
  const cs = getComputedStyle(parent);
  const f = frame.getBoundingClientRect();
  const range = document.createRange();

  // Group the characters into the lines the browser wrapped them into.
  type Line = { text: string; left: number; right: number; top: number; bottom: number };
  const lines: Line[] = [];
  const chars = Array.from(text); // whole emoji, never half of one
  let offset = 0;
  for (const ch of chars) {
    range.setStart(node, offset);
    range.setEnd(node, offset + ch.length);
    offset += ch.length;
    const rects = Array.from(range.getClientRects()).filter((r) => r.height > 0);
    const r = rects[0];
    let line = lines[lines.length - 1];
    if (r) {
      const mid = (r.top + r.bottom) / 2;
      if (!line || mid > line.bottom || mid < line.top) {
        line = { text: "", left: Infinity, right: -Infinity, top: r.top, bottom: r.bottom };
        lines.push(line);
      }
      if (ch.trim()) {
        line.left = Math.min(line.left, r.left);
        line.right = Math.max(line.right, r.right);
      }
    }
    if (line) line.text += ch;
  }

  ctx.save();
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  ctx.fillStyle = cs.color;
  const rtl = cs.direction === "rtl";
  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.textAlign = rtl ? "right" : "left";
  ctx.textBaseline = "alphabetic";
  const m = ctx.measureText("Hgجـ");
  const ascent = m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent;
  const descent = m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent;
  for (const line of lines) {
    const t = line.text.trim();
    if (!t || !isFinite(line.left)) continue;
    const h = line.bottom - line.top;
    const baseline = line.top - f.top + (h - (ascent + descent)) / 2 + ascent;
    ctx.fillText(t, (rtl ? line.right : line.left) - f.left, baseline);
  }
  ctx.restore();
}

// ------------------------------------------------------------------- paint

/** Paint order: stacking (z-index) first, then document order. */
function zOf(el: Element, frame: HTMLElement) {
  for (let n: Element | null = el; n && n !== frame; n = n.parentElement) {
    const cs = getComputedStyle(n);
    if (cs.position !== "static" && cs.zIndex !== "auto") return parseInt(cs.zIndex, 10) || 0;
  }
  return 0;
}

export async function renderInvitePng(frame: HTMLElement): Promise<string> {
  await document.fonts.ready;
  const imgs = Array.from(frame.querySelectorAll("img"));
  await Promise.all(imgs.map((img) => img.decode().catch(() => undefined)));

  const W = frame.offsetWidth;
  const H = frame.offsetHeight;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(W * PIXEL_RATIO);
  canvas.height = Math.round(H * PIXEL_RATIO);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(PIXEL_RATIO, PIXEL_RATIO);

  const elements = [frame, ...Array.from(frame.querySelectorAll("*"))];
  const order = elements
    .map((el, i) => ({ el, i, z: el === frame ? -Infinity : zOf(el, frame) }))
    .sort((a, b) => a.z - b.z || a.i - b.i);

  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip(); // the frame clips its overflow

  for (const { el } of order) {
    // Parts of an icon are drawn with the icon itself.
    if (el instanceof SVGElement && !(el instanceof SVGSVGElement)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const alpha = opacityOf(el, frame);
    if (alpha <= 0.001) continue;

    ctx.save();
    ctx.globalAlpha = alpha;
    const box = layoutBox(el, frame);
    // Icons and text are placed from their on-screen rects, which already
    // include any transform; everything else from its layout box + transform.
    if (!(el instanceof SVGSVGElement)) {
      const m = transformOf(el, frame);
      ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
    }

    if (el instanceof SVGSVGElement) paintIcon(ctx, el, box);
    else if (el instanceof HTMLImageElement) paintImage(ctx, el, cs, box);
    else if (el instanceof HTMLElement) {
      paintBox(ctx, el, cs, box);
      ctx.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0); // text is never transformed here
      for (const child of Array.from(el.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) paintText(ctx, child as Text, frame);
      }
    }
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}
