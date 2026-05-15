# 飞书卡片格式规范

## 核心规则
JSON必须放`card`参数，不能放`message`参数

## JSON格式
```json
{
  "schema": "2.0",
  "header": {"title": {"tag": "plain_text", "content": "标题"}, "template": "blue"},
  "body": {"elements": [{"tag": "markdown", "content": "内容"}]}
}
```

## 5部分日报标准
1. 8大景区抖音指数排名
2. 建业电影小镇深度分析
3. 竞品横向对比
4. 关键洞察
5. 本周行动建议

## 数据业务含义
- 搜索指数 = 潜在游客主动搜索热度
- 综合指数 = 全网曝光综合热度
- 关联词 = 游客兴趣路径
- 人群画像 = 投放策略依据
- 涨跌 = 趋势信号
