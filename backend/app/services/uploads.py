"""Image uploads: validated with Pillow, resized, re-encoded, stored under media/uploads."""

import io
import uuid
from datetime import UTC, datetime

from PIL import Image, ImageOps, UnidentifiedImageError

from app.core.config import settings
from app.core.exceptions import InvalidInputError

MAX_BYTES = 5 * 1024 * 1024
MAX_WIDTH = 1600
FORMATS = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}


def save_image(data: bytes, *, square: int | None = None) -> str:
    """Store an uploaded image and return its public URL (/media/uploads/...).

    With `square`, the image is center-cropped to a square of that size (avatars).
    """
    if len(data) > MAX_BYTES:
        raise InvalidInputError("file", "Images can be up to 5 MB")
    try:
        with Image.open(io.BytesIO(data)) as probe:
            probe.verify()  # catches truncated or corrupt files
        image = Image.open(io.BytesIO(data))
    except (UnidentifiedImageError, OSError, SyntaxError):
        raise InvalidInputError("file", "Upload a JPEG, PNG or WebP image") from None

    fmt = image.format
    if fmt not in FORMATS:
        raise InvalidInputError("file", "Upload a JPEG, PNG or WebP image")

    # Re-encoding drops EXIF data (including GPS location) from photos.
    image = ImageOps.exif_transpose(image)
    if square is not None:
        image = ImageOps.fit(image, (square, square))
    elif image.width > MAX_WIDTH:
        image = image.resize((MAX_WIDTH, round(image.height * MAX_WIDTH / image.width)))

    now = datetime.now(UTC)
    relative = f"uploads/{now:%Y/%m}/{uuid.uuid4().hex}{FORMATS[fmt]}"
    path = settings.media_dir / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    if fmt == "JPEG":
        image.convert("RGB").save(path, quality=82, optimize=True, progressive=True)
    else:
        image.save(path, optimize=True)
    return f"{settings.media_url}/{relative}"
