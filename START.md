# V1.0 安装与运行

将 ZIP 内的文件复制到已 clone 的 health-tracker 根目录，保留原来的 `.git/`。如果已有 README 可保留原文件。建议先提交当前修改或备份，再覆盖同名 CSS 和 JS；这是一套配套版本，不建议混用旧 UI 模块。

## 启动

在项目根目录执行 `python -m http.server 8000`（macOS/Linux 可用 `python3`，Windows 可用 `py`）。打开 http://localhost:8000/ 。不要直接双击 HTML，因为 ES Modules 需要 HTTP 服务。

## 文件说明

- index.html：应用入口。
- css/tokens.css：配色、字号、主题、细蓝色趋势线（1.5px）。
- css/base.css：基础样式。
- css/layout.css：移动端双列卡片、桌面布局、导航。
- css/components.css：公共卡片、按钮、表单、图表容器。
- css/style.css：唯一 CSS 加载入口。
- js/app.js：启动应用。
- js/config.js：数据字段、日期、存储键。
- js/storage.js：LocalStorage 存储。
- js/repository.js：数据增删查改、备份合并与同步接口预留。
- js/ui.js：首页、趋势、记录、设置及交互。
- js/charts.js：原生 SVG 图表，不依赖 Chart.js。
- js/i18n.js：语言和主题偏好管理。
- js/locales/zh-CN.js、en.js：语言包。
- assets/icons/app.svg：图标。
- libs/.gitkeep：预留目录，当前无需第三方库。
- .gitignore：避免提交常见本地备份及环境文件。
- README.md：原项目长期架构路线；本文为当前版本安装说明。

## 使用

首次打开无示例健康数据。首页选择日期，点击添加记录，填写实际数值（饮水以 ml 输入，卡片以 L 显示）。同一天每个项目一条记录。均衡饮食打卡可直接勾选。趋势支持 7/30/90 天；记录支持筛选、编辑、删除。设置可切换中文/英文、深浅色/系统主题、导入导出 JSON、导出 CSV。导入保留本地冲突版本。参考目标是界面示例，可修改 js/ui.js 中 goals；体重不设置减重进度条。

## 发布

`git add .` 前检查 git status，确保没有私人记录或备份文件；提交并 push。GitHub 仓库 Settings → Pages → Deploy from a branch → main → / (root)。打开 Pages 提供的 URL。手机与电脑数据独立保存，本地开发地址和 GitHub Pages 地址也属于不同存储空间，使用 JSON 手动迁移。

## 范围

V1.0 使用 LocalStorage，保留原 v1 数据键和结构。当前无账号、OneDrive 自动同步、IndexedDB、Service Worker/PWA 离线缓存或后台任务。关闭网页后数据通常保留，但清理站点数据可能丢失，请定期导出 JSON。不同标签页同时写入尚无强一致性保证。后续按 README 路线推进。
