#!/usr/bin/env python3
"""
电影小镇运营数据看板
生成可视化HTML，通过本地Web服务器查看
用法: python3 dashboard.py
访问: http://localhost:8888
"""
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.express as px
import json, os, http.server, socketserver, webbrowser

PORT = 8888
OUTPUT_DIR = "/tmp/movie_town_dashboard"
VISITOR_CSV = os.path.expanduser("~/Desktop/2026游客量统计.csv")
ANNUAL_TARGET = 1530000

os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_visitor_data():
    """读取客流数据"""
    if not os.path.exists(VISITOR_CSV):
        return None, None
    df = pd.read_csv(VISITOR_CSV)
    df['日期'] = pd.to_datetime(df['日期'])
    df = df.sort_values('日期').reset_index(drop=True)
    df['累计'] = df['合计'].cumsum()
    df['周'] = df['日期'].dt.isocalendar().week
    df['月'] = df['日期'].dt.month
    # 同比基准（2025）
    ytd = df[df['日期'].dt.year == 2026]['合计'].sum()
    target_progress = ytd / ANNUAL_TARGET * 100
    return df, {'ytd': ytd, 'progress': target_progress}

def create_daily_chart(df):
    """日客流趋势图"""
    fig = make_subplots(rows=2, cols=1, shared_xaxes=True,
                        subplot_titles=('每日客流', '累计客流'),
                        vertical_spacing=0.12)

    # 每日客流
    fig.add_trace(go.Bar(x=df['日期'], y=df['合计'],
                         name='日客流', marker_color='#3498db'),
                  row=1, col=1)

    # 累计客流
    fig.add_trace(go.Scatter(x=df['日期'], y=df['累计'],
                             name='累计', line=dict(color='#e74c3c', width=2),
                             fill='tozeroy', fillcolor='rgba(231,76,60,0.1)'),
                  row=2, col=1)

    # 年度目标线
    fig.add_hline(y=ANNUAL_TARGET, line_dash="dash", line_color="green",
                  annotation_text=f"目标 {ANNUAL_TARGET:,}",
                  row=2, col=1)

    fig.update_layout(height=600, title_text="电影小镇日客流趋势", 
                      template='plotly_white')
    fig.write_html(f"{OUTPUT_DIR}/daily_trend.html")
    return fig

def create_weekly_chart(df):
    """周客流对比"""
    weekly = df.groupby('周').agg({'合计': 'sum'}).reset_index()
    fig = px.bar(weekly, x='周', y='合计', title='周度客流',
                 color='合计', color_continuous_scale='Blues')
    fig.update_layout(template='plotly_white')
    fig.write_html(f"{OUTPUT_DIR}/weekly_trend.html")

def create_summary_card(df, stats):
    """概况卡片HTML"""
    latest = df.iloc[-1]
    week_ago = df.iloc[-8:-1]['合计'].mean() if len(df) >= 8 else 0
    today_vs_avg = ((latest['合计'] - week_ago) / week_ago * 100) if week_ago else 0

    html = f"""
    <div style="display:flex;gap:20px;flex-wrap:wrap;padding:20px;font-family:sans-serif;">
        <div style="background:#2c3e50;color:white;padding:20px;border-radius:10px;flex:1;min-width:200px;">
            <div style="font-size:14px;opacity:0.8;">年度累计客流</div>
            <div style="font-size:36px;font-weight:bold;">{stats['ytd']:,}</div>
            <div style="font-size:14px;">目标 {ANNUAL_TARGET:,} | 进度 {stats['progress']:.1f}%</div>
        </div>
        <div style="background:#27ae60;color:white;padding:20px;border-radius:10px;flex:1;min-width:200px;">
            <div style="font-size:14px;opacity:0.8;">最新日客流 ({latest['日期'].strftime('%m-%d')})</div>
            <div style="font-size:36px;font-weight:bold;">{latest['合计']:,}</div>
            <div style="font-size:14px;">较近7日均值 {today_vs_avg:+.1f}%</div>
        </div>
        <div style="background:#8e44ad;color:white;padding:20px;border-radius:10px;flex:1;min-width:200px;">
            <div style="font-size:14px;opacity:0.8;">数据记录</div>
            <div style="font-size:36px;font-weight:bold;">{len(df)}天</div>
            <div style="font-size:14px;">{df['日期'].min().strftime('%Y-%m-%d')} → {df['日期'].max().strftime('%Y-%m-%d')}</div>
        </div>
    </div>
    """
    return html

def generate_index(summary_html):
    """生成首页"""
    index = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>电影小镇运营看板</title>
<style>
body {{ margin:0; background:#f5f6fa; font-family:-apple-system,BlinkMacSystemFont,sans-serif; }}
.header {{ background:linear-gradient(135deg,#2c3e50,#3498db); color:white; padding:30px; text-align:center; }}
.header h1 {{ margin:0; font-size:28px; }}
.header p {{ margin:5px 0 0; opacity:0.8; font-size:14px; }}
.nav {{ display:flex; justify-content:center; gap:15px; padding:15px; background:white; border-bottom:1px solid #ddd; }}
.nav a {{ color:#3498db; text-decoration:none; font-size:14px; padding:8px 16px; border-radius:20px; }}
.nav a:hover {{ background:#3498db; color:white; }}
iframe {{ width:100%; height:700px; border:none; }}
</style></head><body>
<div class="header">
    <h1>🎬 建业电影小镇 · 运营数据看板</h1>
    <p>自动更新 | 年度目标 {ANNUAL_TARGET:,} | 数据来源：每日客流CSV + 抖音指数</p>
</div>
{summary_html}
<div class="nav">
    <a href="daily_trend.html" target="main">📊 日客流趋势</a>
    <a href="weekly_trend.html" target="main">📈 周度对比</a>
</div>
<iframe name="main" src="daily_trend.html"></iframe>
<p style="text-align:center;color:#999;font-size:12px;padding:10px;">
    数据自动刷新 | 更新: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M')}
</p>
</body></html>"""
    with open(f"{OUTPUT_DIR}/index.html", 'w') as f:
        f.write(index)

def main():
    print("📊 加载客流数据...")
    result = load_visitor_data()
    if result[0] is None:
        print("❌ 未找到客流CSV文件")
        # 生成占位页面
        with open(f"{OUTPUT_DIR}/index.html", 'w') as f:
            f.write("<html><body><h1>请先配置客流CSV</h1></body></html>")
    else:
        df, stats = result
        print(f"   读取 {len(df)} 天数据，年度累计 {stats['ytd']:,}")
        create_daily_chart(df)
        create_weekly_chart(df)
        summary = create_summary_card(df, stats)
        generate_index(summary)
        print("✅ Dashboard HTML 已生成")

    # 启动服务器
    os.chdir(OUTPUT_DIR)
    handler = http.server.SimpleHTTPRequestHandler
    httpd = socketserver.TCPServer(("", PORT), handler)
    print(f"\n🌐 访问看板: http://localhost:{PORT}")
    webbrowser.open(f"http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 服务已停止")

if __name__ == "__main__":
    main()
