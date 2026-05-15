#!/bin/bash
# 抖音关键词数据采集脚本

KEYWORDS=(
  "万岁山武侠城"
  "郑州方特欢乐世界"
  "郑州海昌海洋公园"
  "清明上河园"
  "只有河南戏剧幻城"
  "郑州银基动物王国"
  "只有红楼梦戏剧幻城"
  "建业电影小镇"
)

for kw in "${KEYWORDS[@]}"; do
  echo "正在采集: $kw"
  
  # 等待页面加载
  sleep 2
  
  # 获取输入框索引
  INPUT_IDX=$(browser-use state 2>&1 | grep -oP 'SHADOW\(open\)\|\[(\d+)\]<input placeholder=请输入' | grep -oP '\d+' | head -1)
  
  if [ -z "$INPUT_IDX" ]; then
    echo "  找不到输入框，跳过"
    continue
  fi
  
  # 输入关键词
  browser-use input "$INPUT_IDX" "$kw" 2>&1
  
  # 等待输入生效
  sleep 1
  
  # 点击搜索按钮
  SEARCH_BTN=$(browser-use state 2>&1 | grep -A2 "input.*$kw" | grep -oP '\[(\d+)\]<div' | grep -oP '\d+' | head -1)
  if [ -z "$SEARCH_BTN" ]; then
    SEARCH_BTN=$(browser-use state 2>&1 | grep -oP '\[(\d+)\]<div />' | grep -oP '\d+' | head -1)
  fi
  
  browser-use click "$SEARCH_BTN" 2>&1
  
  # 等待结果加载
  sleep 3
  
  # 截图
  SAFE_KW=$(echo "$kw" | tr -d ' ')
  browser-use screenshot "/tmp/keyword_${SAFE_KW}.png" 2>&1
  
  # 向下滚动
  browser-use scroll down 2>&1
  sleep 1
  
  # 获取数据
  browser-use state 2>&1 | grep -E "([0-9]+万|[0-9]+\.[0-9]万|[0-9]+%)" | head -10
  
  echo "---"
done

echo "采集完成"
