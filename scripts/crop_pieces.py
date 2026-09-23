from PIL import Image
import numpy as np
from scipy import ndimage
import os

img = Image.open('public/images/logo.png').convert('RGBA')
arr = np.array(img)
r, g, b, a = (
    arr[..., 0].astype(int),
    arr[..., 1].astype(int),
    arr[..., 2].astype(int),
    arr[..., 3],
)

green_mask = (a > 10) & (g > r + 15) & (g > b + 15) & (g > 60)
maroon_mask = (a > 10) & (r > g + 30) & (r > b + 30) & (r > 90) & (r < 210) & (g < 140)
blue_mask = (a > 10) & (b > r + 15) & (b > g + 5)
mustard_mask = (a > 10) & (r > 180) & (g > 140) & (b < 160) & (r > b + 60)

os.makedirs('public/images/pieces', exist_ok=True)


def largest_component_bbox(mask):
    structure = np.ones((3, 3), dtype=int)
    labeled, n = ndimage.label(mask, structure=structure)
    if n == 0:
        return None
    sizes = ndimage.sum(mask, labeled, range(1, n + 1))
    biggest = int(np.argmax(sizes)) + 1
    ys, xs = np.where(labeled == biggest)
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


for name, mask in [
    ('green', green_mask),
    ('maroon', maroon_mask),
    ('blue', blue_mask),
    ('mustard', mustard_mask),
]:
    box = largest_component_bbox(mask)
    print(name, box)
    if box is None:
        continue
    x0, y0, x1, y1 = box
    pad = 10
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(img.width, x1 + pad), min(img.height, y1 + pad)
    crop = img.crop((x0, y0, x1, y1))
    crop.save(f'public/images/pieces/{name}.png')
    print(' saved size', crop.size)
