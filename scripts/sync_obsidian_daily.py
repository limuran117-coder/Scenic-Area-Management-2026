#!/usr/bin/env python3
"""
每天自动同步数据到Obsidian Wiki
- 读取飞书多维表格最新数据
- 更新当日日志文件
- 追加到历史分析文档
"""
import json
import subprocess
from datetime import datetime, timedelta

# 获取昨天的日期
yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
today = datetime.now().strftime('%Y-%m-%d')

MEMORY_DIR = '/Users/tianjinzhan/.openclaw/workspace/memory'
OBSIDIAN_DIR = '/Users/tianjinzhan/.openclaw/workspace/wiki'
FEISHU_APP = 'GmqWbb21zamf6pszdxncIVwkn4e'
FEISHU_TABLE = 'tblQGnQGVI8THM3O'

def get_feishu_token():
    result = subprocess.run([
        'curl', '-s', '-X', 'POST',
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        '-H', 'Content-Type: application/json',
        '-d', '{"app_id":"cli_a941d5340639dcef","app_secret":"yNMaSBoHmrn9FcsrpWCzlcerQCD5aHji"}'
    ], capture_output=True, text=True, timeout=10)
    data = json.loads(result.stdout)
    return data.get('tenant_access_token', '')

def fetch_yesterday_data(token):
    yesterday_start = int(datetime.strptime(yesterday, '%Y-%m-%d').timestamp() * 1000)
    yesterday_end = int((datetime.strptime(yesterday, '%Y-%m-%d') + timedelta(days=1)).timestamp() * 1000)
    
    result = subprocess.run([
        'curl', '-s', '-X', 'POST',
        f'https://open.feishu.cn/open-apis/bitable/v1/apps/{FEISHU_APP}/tables/{FEISHU_TABLE}/records/search',
        '-H', f'Authorization: Bearer {token}',
        '-H', 'Content-Type: application/json',
        '-d', json.dumps({
            'filter': {'conjunction': 'and', 'conditions': [
                {'field_name': '日期', 'operator': 'between', 'value': [yesterday_start, yesterday_end]}
            ]}
        })
    ], capture_output=True, text=True, timeout=15)
    
    data = json.loads(result.stdout)
    items = data.get('data', {}).get('items', [])
    return items[0]['fields'] if items else None

def update_daily_log(fields):
    """更新日签到memory文件"""
    log_path = f'{MEMORY_DIR}/{yesterday}.md'
    
    total = fields.get('合计客流', 0)
    xianshang = fields.get('线上散客', 0)
    weather = fields.get('天气备注', '')
    
    content = f"""# {yesterday} 日报汇总

## 当日客流数据
- 合计客流: {total}
- 线上散客: {xianshang}
- 天气: {weather}

"""
    with open(log_path, 'a') as f:
        f.write(content)
    print(f'已更新日志: {log_path}')

def main():
    token = get_feishu_token()
    if not token:
        print('获取token失败')
        return
    
    data = fetch_yesterday_data(token)
    if data:
        update_daily_log(data)
        print(f'{yesterday} 数据同步完成: 客流={data.get("合计客流",0)}')
    else:
        print(f'{yesterday} 无数据或获取失败')

if __name__ == '__main__':
    main()
