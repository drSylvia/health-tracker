# Health Tracker — Weight Trend Chart Fix

## 本次修改
- 体重趋势图纵轴固定为 `50–65 kg`
- 体重趋势图固定刻度为 `50 / 55 / 60 / 65`
- 缩小图表高度，使网格行距更紧凑

## 需要替换的文件
- `js/charts.js`
- `css/components.css`

## 放置位置
```
health-tracker/js/charts.js
health-tracker/css/components.css
```

## 使用方法
1. 覆盖以上两个文件
2. 刷新本地页面（建议 `Ctrl + F5` 强制刷新）
3. 若满意，再提交 Git

## 建议提交
```bash
git add js/charts.js css/components.css
git commit -m "fix(chart): set weight chart range to 50-65 and tighten spacing"
```

## 说明
本次只修改图表显示逻辑和图表容器高度，不影响现有健康记录、热量目标、语言切换或其他业务逻辑。
