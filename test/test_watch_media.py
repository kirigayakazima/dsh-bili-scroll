import io
import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).parent.parent / "vendor" / "bilibili-mcp"))
from mcp_server import _compose_storyboard, _watched_entries, _watched_subtitles


def test_subtitle_cutoff_excludes_crossing_and_future_lines():
    lines = [
        {"from": 1, "to": 4, "content": "开场"},
        {"from": 4, "to": 5, "content": "最后一句"},
        {"from": 4.5, "to": 6, "content": "横跨检查点"},
        {"from": 7, "to": 8, "content": "未来"},
    ]
    assert [line["content"] for line in _watched_subtitles(lines, 5)] == ["开场", "最后一句"]


def test_frame_cutoff_removes_future_pixels_before_encoding():
    entries = _watched_entries([(0, 0), (4, 1), (5, 2), (5.01, 3)], 5)
    assert entries == [(0, 0), (4, 1), (5, 2)]
    tiles = [Image.new("RGB", (480, 270), color) for color in ("blue", "blue", "blue", "red")]
    content = _compose_storyboard([tiles[i] for _, i in entries], [{"got_sec": sec} for sec, _ in entries])
    frame = Image.open(io.BytesIO(content))
    assert max(frame.size) == 768
    for x in (120, 384, 640):
        red, _, blue = frame.getpixel((x, frame.height // 2))
        assert blue > 220 and red < 20
