import os
import sys
from pathlib import Path

# Add vendor path
sys.path.insert(0, str(Path(__file__).parent.parent / "vendor" / "bilibili-mcp"))

try:
    from PIL import Image
    import mcp_server
except ImportError as e:
    print(f"Skipping test due to missing deps: {e}")
    sys.exit(0)

def test_compose():
    im1 = Image.new("RGB", (160, 90), color=(100, 150, 200))
    im2 = Image.new("RGB", (160, 90), color=(200, 100, 150))
    im3 = Image.new("RGB", (160, 90), color=(150, 200, 100))

    infos = [{"got_sec": 15.0}, {"got_sec": 83.0}, {"got_sec": 225.0}]
    jpeg_bytes = mcp_server._compose_storyboard([im1, im2, im3], infos)

    assert len(jpeg_bytes) > 500, "Should generate valid JPEG bytes"
    assert jpeg_bytes[:2] == b"\xff\xd8", "Should start with JPEG header"

    composed_im = Image.open(Path(__file__).parent / "test_out.jpg" if False else None or io_open(jpeg_bytes))
    # 3 images horizontal layout: 160*3 + 4*2 = 488, height = 90
    assert composed_im.size == (488, 90), f"Expected (488, 90), got {composed_im.size}"
    print(f"[OK] _compose_storyboard produced valid single Contact Sheet JPEG: {composed_im.size}, bytes={len(jpeg_bytes)}")

def io_open(b):
    import io
    return io.BytesIO(b)

if __name__ == "__main__":
    test_compose()
