#!/usr/bin/env python3
"""
飞书卡片发送脚本
用法: python3 send_feishu_card.py <chat_id> <card_json>
示例: python3 send_feishu_card.py oc_xxx '{"header":{"title":{"tag":"plain_text","content":"test"}}}'
"""
import json
import sys
import urllib.request

APP_ID = "cli_a941d5340639dcef"
APP_SECRET = "yNMaSBoHmrn9FcsrpWCzlcerQCD5aHji"
API_BASE = "https://open.feishu.cn/open-apis"

def get_token():
    url = f"{API_BASE}/auth/v3/tenant_access_token/internal"
    payload = json.dumps({"app_id": APP_ID, "app_secret": APP_SECRET})
    req = urllib.request.Request(url, data=payload.encode(), 
                                headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
    return data["tenant_access_token"]

def send_card(chat_id, card):
    token = get_token()
    url = f"{API_BASE}/im/v1/messages?receive_id_type=chat_id"
    payload = json.dumps({
        "receive_id": chat_id,
        "msg_type": "interactive",
        "content": json.dumps(card, ensure_ascii=False)
    }, ensure_ascii=False)
    req = urllib.request.Request(url, data=payload.encode("utf-8"),
                                headers={
                                    "Authorization": f"Bearer {token}",
                                    "Content-Type": "application/json"
                                }, method="POST")
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode())
    if result.get("code") == 0:
        print(f"✅ 发送成功: {result['data']['message_id']}")
    else:
        print(f"❌ 发送失败: {result}")
    return result

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    chat_id = sys.argv[1]
    card = json.loads(sys.argv[2])
    send_card(chat_id, card)
