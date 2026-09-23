"""Puzzle-slicing source: just the تشابك logo, background keyed out,
on a flat cream backdrop. Uses the clean re-exported logo (crisper linework
than the original screenshot-derived file) and keeps upscaling minimal."""
from PIL import Image
import numpy as np

SIZE = 680


def key_white(im: Image.Image, threshold=248, feather=55) -> Image.Image:
    arr = np.array(im.convert("RGBA")).astype(int)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    whiteness = (r + g + b) / 3
    key_alpha = np.clip((threshold - whiteness) / feather, 0, 1) * 255
    arr[..., 3] = np.minimum(a, key_alpha).astype(np.uint8)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def trim(im: Image.Image, pad=4) -> Image.Image:
    mask = np.array(im)[..., 3] > 10
    ys, xs = np.where(mask)
    x0, y0 = max(0, xs.min() - pad), max(0, ys.min() - pad)
    x1, y1 = min(im.width, xs.max() + pad), min(im.height, ys.max() + pad)
    return im.crop((x0, y0, x1, y1))


logo = trim(key_white(Image.open("public/images/brand/logo-clean.png")))

base = Image.new("RGBA", (SIZE, SIZE), (253, 248, 239, 255))  # flat cream-50

target_w = int(SIZE * 0.96)
scale = target_w / logo.width
target_h = int(logo.height * scale)
logo_r = logo.resize((target_w, target_h), Image.LANCZOS)
lx = (SIZE - target_w) // 2
ly = (SIZE - target_h) // 2
base.alpha_composite(logo_r, (lx, ly))

base.save("public/images/puzzle-source.png")
print("saved", base.size, "scale", round(scale, 2))
