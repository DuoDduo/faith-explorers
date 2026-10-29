"""Resize and recompress the legacy site's photos (44 MB of originals).

Writes web-sized copies with URL-safe names:
  * every image  -> backend/media/images/   (served by the API at /media/images/...)
  * UI-only ones -> frontend/public/images/ (logo, page heroes, testimonials, icons)

Usage (from backend/):  uv run python -m scripts.optimize_images
"""

import shutil
from pathlib import Path

from PIL import Image, ImageOps

from app.utils.text import slugify

REPO = Path(__file__).resolve().parents[2]
SOURCE = REPO / "legacy" / "sopimages"
MEDIA_OUT = REPO / "backend" / "media" / "images"
PUBLIC_OUT = REPO / "frontend" / "public" / "images"

# Head-shots only need to be small.
AVATARS = {
    "20230314_134145", "blessing", "efire", "emmanuel", "esther", "nike",
    "niyi", "pstflo", "tunmise", "uche", "wale", "wuraola",
}  # fmt: skip
UI_IMAGES = {
    "Faith", "Faith2", "HOE MAY", "HOE MAY-2", "HOE MAY-3", "HOE MAY-7", "HOE MAY-12",
    "HOE MAY-14", "HOE MAY-37", "HOE MAY-41", "HOE MAY-76", "emmanuel", "tunmise", "esther",
    "wuraola", "plus", "minus",
}  # fmt: skip


def output_name(path: Path) -> str:
    return slugify(path.stem) + path.suffix.lower()


def optimize(src: Path, dest: Path) -> None:
    if src.suffix.lower() == ".svg":
        shutil.copyfile(src, dest)
        return
    with Image.open(src) as img:
        img = ImageOps.exif_transpose(img)
        max_width = 480 if src.stem in AVATARS else 1600
        if img.width > max_width:
            img = img.resize((max_width, round(img.height * max_width / img.width)))
        if src.suffix.lower() == ".png":
            img.save(dest, optimize=True)
        else:
            img.convert("RGB").save(dest, quality=80, optimize=True, progressive=True)


def main() -> None:
    MEDIA_OUT.mkdir(parents=True, exist_ok=True)
    PUBLIC_OUT.mkdir(parents=True, exist_ok=True)
    before = after = 0
    for src in sorted(SOURCE.iterdir()):
        dest = MEDIA_OUT / output_name(src)
        optimize(src, dest)
        if src.stem in UI_IMAGES:
            shutil.copyfile(dest, PUBLIC_OUT / dest.name)
        before += src.stat().st_size
        after += dest.stat().st_size
    print(f"{before / 1e6:.1f} MB -> {after / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
