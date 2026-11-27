# V1.1.7 — 长期同步性能优化（第一部分）

基于 V1.1.5 更新包与 V1.1.6 手机端 CSS 修复。覆盖本包内文件到现有项目根目录。保留 js/cloud-config.js、js/config.js、release.py、其他原有 CSS 和 assets。版本已更新，不需要再运行 release.py。

## 已实现
- IndexedDB 持久化修订内容和文件索引，按 OAuth Client ID + Drive 用户 permissionId 隔离。不会持久化 OAuth token。缓存仅用于加速，不替代本地记录或云端备份。
- Drive changes.list 增量索引：首次取得游标后扫描列表，再回放变更；后续使用游标，仅下载新文件或 version 改变的文件。变更接口异常时回退完整列表。
- 仍验证修订及父节点，迭代遍历避免长期历史导致递归栈溢出。缺失父节点/环路仍拒绝合并。沿用原有冲突、删除标记和并发分支逻辑。
- 缓存不可用或超过约1200万 JSON 字符时回退会话缓存；不删除任何云端文件。持久缓存是完整图快照，不是云端检查点。

## 尚未完成
云端检查点及历史压缩尚未实现。全新设备仍需下载完整历史；长期文件内容、图计算、缓存大小仍会增长。缓存被浏览器清除或超过限额时可能重新下载。真实浏览器 IndexedDB 持久性及 Google Drive 变更接口尚未联调。Google 授权仍需在刷新后重新连接。

## 测试
Node 语法检查；模拟首次扫描期间新增文件、无变化、分页变更、更新/移除、失效游标回退、IndexedDB 不可用、20000 节点图及缺失父节点/环路检测。非真实 Google API 测试。

## 本地验收
1. 导出 JSON 备份，覆盖更新文件，确认版本 V1.1.7 及手机导入导出布局正常。
2. 连接原 Google 账户并同步。首次建立缓存可能较慢。
3. 刷新页面，重新连接并同步。开发者工具 Network 筛选 googleapis.com：无变化时应主要看到 about（每次授权会话）、changes（以及必要的备份检查），而不是大量 alt=media 请求。
4. 手机新增测试记录，同步后电脑接收，反向测试；验证删除、冲突和备份仍正常。
5. 如发现异常，保留独立备份，暂停自动同步；不要清除 LocalStorage 或删除云端文件。

发布：git add . ; git commit -m "perf: persist revision cache and poll Drive changes" ; git push origin main
