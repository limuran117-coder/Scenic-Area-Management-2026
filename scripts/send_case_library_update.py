#!/usr/bin/env python3
"""发送案例库更新飞书卡片"""
import sys
import json
import subprocess

def send_card(chat_id, card):
    cmd = [
        'python3',
        '/Users/tianjinzhan/.openclaw/workspace/scripts/send_feishu_card.py',
        chat_id,
        json.dumps(card)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)
    print(result.stderr)
    return result.stdout

if __name__ == "__main__":
    chat_id = sys.argv[1] if len(sys.argv) > 1 else "oc_2581c03b79e4893cc3616b253d60f34e"
    card = {
        "schema": "2.0",
        "header": {
            "title": {"tag": "plain_text", "content": "📚 案例库更新 | 2026-04-25（五一预热专题）"},
            "template": "orange"
        },
        "body": {
            "elements": [
                {"tag": "markdown", "content": "## 📌 一、本期新增案例\n\n**五一假期景区营销预热策略**\n\n• **平台：** 抖音/小红书/微博\n• **数据：** 五一假期为全年流量高峰，各景区提前2周启动预热\n• **爆款分析：** 话题前置+套餐预售+内容矩阵打法\n• **借鉴思路：** 电影小镇需提前发布\"五一穿越指南\"，设计穿越套票\n\n---\n\n## 📌 二、案例库动态\n\n| 周期 | 新增 | 累计 |\n|------|------|------|\n| 第17周 | 4个 | 14个 |\n\n**本期入库：**\n1. 五一假期景区营销预热策略（#节日营销 #五一 #流量获取）\n2. 郑州海昌水下国潮（#夜游 #文化IP #打卡经济）\n3. 打铁花跨景区爆款（#夜游 #视觉奇观 #情绪张力）\n4. 银基\"超出片\"品牌定位（#品牌定位 #打卡经济）\n\n---\n\n## 📌 三、归档标准说明\n\n入库条件（满足其一）：\n• 内容有创意\n• 流量异常高\n• 营销手法新颖\n\n---\n\n*由 AI Agent 归档 | 案例库持续积累*"
                }
            ]
        }
    }
    send_card(chat_id, card)
