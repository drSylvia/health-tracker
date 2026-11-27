# 如序 · Morrow — V1.2.0

生活有序，未来可期。

*Every day shapes tomorrow.*

个人健康记录、每日能量、趋势、目标、数据备份与 Google Drive 双向同步。纯静态 HTML/CSS/JS，支持中英文及深浅主题。

## 运行
在项目根目录运行 `python -m http.server 8000`，打开 `http://localhost:8000/`。GitHub Pages 可直接部署。完整源码中的 `js/cloud-config.js` 使用占位 Client ID；如已有配置请保留，不要覆盖。详情见 AGENTS.md。

## 桌面图标
使用现有心形 SVG，新增 Apple touch icon 与 manifest，支持浏览器识别应用名称及图标。安装后显示名称由平台决定。没有 Service Worker，暂不保证离线启动。

## 升级
现有项目使用 update.zip，先备份数据并同步，覆盖后检查版本 1.2.0。不要清理浏览器数据。详见 UPDATE.md。
