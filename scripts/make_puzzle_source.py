"""Composite the تشابك logo (background keyed out) onto a soft warm brand
backdrop so every jigsaw piece has color/texture, not raw white space."""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

SIZE = 960

logo = Image.open("public/images/brand/logo-clean.png").convert("RGBA")
arr = np.array(logo).astype(int)
r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
whiteness = (r + g + b) / 3
# Soft key: fully white -> transparent, dark/colored -> opaque, smooth ramp between.
key_alpha = np.clip((248 - whiteness) / 55.0, 0, 1) * 255
new_alpha = np.minimum(a, key_alpha).astype(np.uint8)
arr[..., 3] = new_alpha
logo_keyed = Image.fromarray(arr.astype(np.uint8), "RGBA")

mask = np.array(logo_keyed)[..., 3] > 10
ys, xs = np.where(mask)
pad = 8
x0, y0 = max(0, xs.min() - pad), max(0, ys.min() - pad)
x1, y1 = min(logo.width, xs.max() + pad), min(logo.height, ys.max() + pad)
logo_cropped = logo_keyed.crop((x0, y0, x1, y1))

base = Image.new("RGBA", (SIZE, SIZE), (253, 248, 239, 255))  # cream-50


def blob(color, cx, cy, radius, opacity):
    layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color + (opacity,))
    return layer.filter(ImageFilter.GaussianBlur(radius * 0.75))


washes = [
    ((90, 154, 111), 140, 120, 340, 110),     # sage top-left
    ((168, 90, 88), 830, 130, 340, 100),      # maroon top-right
    ((243, 194, 67), 840, 840, 380, 130),     # mustard bottom-right
    ((152, 205, 243), 120, 830, 340, 115),    # steel bottom-left
]
for color, cx, cy, rad, op in washes:
    base = Image.alpha_composite(base, blob(color, cx, cy, rad, op))

# Decorative ring, badge-style.
ring = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
rd = ImageDraw.Draw(ring)
m = 34
rd.ellipse([m, m, SIZE - m, SIZE - m], outline=(173, 130, 83, 90), width=3)
base = Image.alpha_composite(base, ring)

# Faint dot texture for warmth.
dots = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
dd = ImageDraw.Draw(dots)
rng = np.random.default_rng(3)
for _ in range(120):
    x = rng.integers(40, SIZE - 40)
    y = rng.integers(40, SIZE - 40)
    rr = rng.integers(2, 4)
    dd.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(173, 130, 83, 22))
base = Image.alpha_composite(base, dots)

# Paste the transparent, cropped logo scaled to fill most of the canvas.
target_w = int(SIZE * 0.9)
scale = target_w / logo_cropped.width
target_h = int(logo_cropped.height * scale)
logo_resized = logo_cropped.resize((target_w, target_h), Image.LANCZOS)
lx = (SIZE - target_w) // 2
ly = (SIZE - target_h) // 2
base.alpha_composite(logo_resized, (lx, ly))

base.save("public/images/puzzle-source.png")
print("saved", base.size)
