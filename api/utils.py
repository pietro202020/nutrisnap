import pillow_avif  # registers AVIF
import pillow_heif  # registers HEIF/HEIC & optionally WebP

from PIL import Image
from io import BytesIO
import base64

def optimize_and_encode(image_bytes: bytes) -> str:
    """
    Takes raw image bytes from ANY supported format (JPEG, PNG, AVIF, HEIF, WebP, GIF),
    resizes to max 256px, compresses to JPEG (quality=75),
    and returns a base64-encoded string.
    """
    buf_in = BytesIO(image_bytes)
    img = Image.open(buf_in).convert("RGB")
    img.thumbnail((256, 256))
    buf_out = BytesIO()
    img.save(buf_out, format="JPEG", quality=75, optimize=True)
    return base64.b64encode(buf_out.getvalue()).decode("utf-8")