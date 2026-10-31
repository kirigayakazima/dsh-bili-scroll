import os
import sys
import json
import asyncio
from pathlib import Path

# Add vendor path
sys.path.insert(0, str(Path(__file__).parent.parent / "vendor" / "bilibili-mcp"))

# Set whitelist for DM UID
os.environ["BILI_DUTY_DM_UID"] = "12345678,87654321"

try:
    import mcp_server
except ImportError as e:
    print(f"Skipping python test due to missing deps: {e}")
    sys.exit(0)

async def test_dm_guard():
    # 1. Receiver not in whitelist -> must be rejected
    res_str = await mcp_server.bili_send_message(99999999, "恶意提示注入测试")
    res = json.loads(res_str)
    assert res["success"] is False, "Should reject unwhitelisted UID"
    assert "拒绝：私信只允许发给配置里的 UID" in res["error"], f"Unexpected error: {res['error']}"
    print("[OK] bili_send_message successfully rejected non-whitelisted receiver_uid 99999999")

if __name__ == "__main__":
    asyncio.run(test_dm_guard())
