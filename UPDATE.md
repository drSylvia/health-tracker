# V1.2.0 — 正式 Web 版

- 基于 V1.1.17；业务逻辑与页面布局仅更新版本引用，不新增业务功能。
- 新增桌面应用 PNG 图标与 manifest，保留原 app.svg 浏览器图标。
- 正式品牌如序 · Morrow，桌面简称 Morrow。
- 更新 release.py，支持 PNG 与 manifest 引用版本。
- 现有项目请使用 update.zip，保留 js/cloud-config.js；无需再次运行 release.py。
- 先同步、导出 JSON，确认备份后再处理旧桌面快捷方式。安装后检查本地记录；如独立存储为空，使用同步/备份恢复，不要盲目删除原数据。
- 完整包根据 V1.1.12 交接源码和 V1.1.17 累积更新重建，不含真实 Client ID、用户数据或令牌，未对照当前 GitHub 仓库私有修改。
- 未进行真实 iOS/Android 安装与 OAuth 联调；没有 Service Worker，不保证离线启动。
- 本次已执行：Node JavaScript 语法检查、业务 JS/CSS 版本外字节一致性、静态资源引用与版本检查、PNG 尺寸检查、release.py 同版本重复执行检查。
