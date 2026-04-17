# Nudge 待处理队列

## 队列说明
本文件记录待处理的Periodic Nudge项。
每日复盘时会检查并处理这些项。

## 手动添加nudge
可以直接编辑本文件添加，或使用脚本：
```bash
python3 scripts/periodic_nudge.py --add "类型" "内容" "建议"
```

## 队列格式
```markdown
- type: rule_conflict
  content: "规则冲突描述"
  suggestion: "建议"
  created: "时间"
```

---

<!-- 下面的内容由脚本自动管理 -->
<!-- 请勿手动编辑，使用 periodic_nudge.py 添加 -->
