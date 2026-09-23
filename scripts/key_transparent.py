"""Key out the white background of the new brand assets and trim to content,
so they can be layered as PNGs with real transparency."""
from PIL import Image
import numpy as np
import sys

FILES = [
    "mascot-nerve",
    "mascot-muscle",
    "piece-green",
    "piece-mustard",
    "piece-maroon",
]

for name in FILES:
    path = f"public/images/brand/{name}.png"
    im = Image.open(path).convert("RGBA")
    arr = np.array(im).astype(int)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    whiteness = (r + g + b) / 3
    key_alpha = np.clip((250 - whiteness) / 18.0, 0, 1) * 255
    arr[..., 3] = key_alpha.astype(np.uint8)
    out = Image.fromarray(arr.astype(np.uint8))

    mask = np.array(out)[..., 3] > 10
    ys, xs = np.where(mask)
    pad = 4
    x0, y0 = max(0, xs.min() - pad), max(0, ys.min() - pad)
    x1, y1 = min(out.width, xs.max() + pad), min(out.height, ys.max() + pad)
    out = out.crop((x0, y0, x1, y1))

    out.save(f"public/images/brand/{name}-t.png")
    print(name, "->", out.size)
