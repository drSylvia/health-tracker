# 版本记录

# V1.2.0 — 正式 Web 版

- 基于 V1.1.17；业务逻辑与页面布局仅更新版本引用，不新增业务功能。
- 新增桌面应用 PNG 图标与 manifest，保留原 app.svg 浏览器图标。
- 正式品牌如序 · Morrow，桌面简称 Morrow。
- 更新 release.py，支持 PNG 与 manifest 引用版本。
- 现有项目请使用 update.zip，保留 js/cloud-config.js；无需再次运行 release.py。
- 先同步、导出 JSON，确认备份后再处理旧桌面快捷方式。安装后检查本地记录；如独立存储为空，使用同步/备份恢复，不要盲目删除原数据。
- 完整包根据 V1.1.12 交接源码和 V1.1.17 累积更新重建，不含真实 Client ID、用户数据或令牌，未对照当前 GitHub 仓库私有修改。
- 未进行真实 iOS/Android 安装与 OAuth 联调；没有 Service Worker，不保证离线启动。


## health-tracker-v1.1.17

# V1.1.17 — Settings Brand Motto

- 设置页底部原 goalNote 提示替换为两行品牌寄语，英文斜体，居中显示。
- 保留版本号和健康目标区的其他说明；中英文界面一致。
- 不改变数据模型、算法、同步或 Client ID。
- 版本引用统一至 1.1.17；覆盖更新包即可，无需 release.py。
- JS 语法及 ZIP 完整性检查；未进行真实浏览器测试。

## health-tracker-v1.1.16

# V1.1.16 — Morrow Branding

- 正式品牌：如序 · Morrow；中英文标题与浏览器标题一致。
- 原有心形图标、配色、图表、底部导航及工具栏保持不变。
- GitHub 地址、存储键、Drive 文件名、Client ID 不变；更新包不含 cloud-config.js。
- AGENTS.md 更新品牌规范；未来 PWA 简称 Morrow，本版不实施 PWA。
- 覆盖更新包即可，不必再次执行 release.py。
- 测试：JS 语法、双语最终品牌值、版本一致性、非品牌代码对比、ZIP 完整性；未进行真实浏览器及 Drive 联调。

## health-tracker-v1.1.15

# V1.1.15 — Bottom Navigation & Settings Cleanup

- 手机及电脑统一固定底部导航，主内容预留底部空间及安全区。
- 设置页取消顶部重复云端快捷条，保留详细云端模块及操作。
- 首页日期、云端快捷按钮、同步反馈、卡片顺序不变。
- 数据、能量算法、同步及备份协议不变；保留 Client ID。
- 覆盖更新包，不需要运行 release.py。
- 测试：JavaScript 语法、DOM 顺序静态检查、核心代码对比及 ZIP 完整性；实际浏览器与 Google Drive 联调尚未执行。

## health-tracker-v1.1.14

# V1.1.14 — Dashboard Cloud Shortcuts

- 品牌统一为 Health Tracker；标题上方为选中日期与星期。
- 首页日期胶囊与云端快捷操作同一工具栏，保留同步反馈；窄屏自动换行。
- 设置快捷操作保留，使用等宽等高修正 CSS；详细模块不变。
- 同步期间显示工作状态，避免旧结果与当前状态混淆。
- 数据、能量和同步引擎不变；保留原 Client ID。
- 覆盖更新包，不需要运行 release.py；先备份并检查真实手机、电脑与 Google Drive。

测试：全部 JS 语法、版本引用目标、核心 JS 对比、模拟 DOM 快捷操作（含首页隐藏详细卡片、忙状态及完成反馈）通过。Chromium 本地地址被环境策略阻止（ERR_BLOCKED_BY_ADMINISTRATOR），未完成真实布局及 Drive 联调。

## health-tracker-v1.1.13

# V1.1.13 — Mobile Settings Shortcut & Home Order

- 设置首屏新增云端快捷操作条：未授权时连接 Google Drive；已授权时立即同步、断开。状态与操作结果同步显示；详细模块保留原位置及功能。快捷按钮调用同一处理函数，沿用 busy 锁、授权、冲突处理、同步及备份流程。
- 首页顺序：四项指标 → 每日能量 → 90 日体重趋势 → 习惯/记录。
- 中英文、主题变量、自动换行及 44px 触控按钮；不改数据模型、能量算法、存储或同步引擎。
- 更新包排除 cloud-config.js；覆盖后不需要 release.py。AGENTS.md 更新为新基线。
- 真正 Google Drive 授权及手机验收须在正式站点完成；不要清除站点数据。

## 验证
- Node.js 全部 JS 语法检查、相对版本引用及目标文件检查通过。核心模块去除版本引用差异后逐字一致。
- 模拟 DOM 与授权/同步函数测试通过：两个入口共用处理函数、连接过程中双入口禁用、快捷连接/同步/断开、详细入口连接/断开后快捷状态一致。
- 首页及设置顺序静态检查通过。
- Chromium 尝试加载 localhost 时被环境策略 ERR_BLOCKED_BY_ADMINISTRATOR 拦截；未完成真实浏览器布局、320–430px 实测、中英文/主题视觉及真实 Drive 联调。

## health-tracker-v1.1.12

# V1.1.12 — Daily Energy Adjustment
新增 dailyBaseline 每日基础及日常消耗记录，优先于设置默认值，首页注明来源；额外运动规则不变。历史趋势复用同一计算。留空不修改既有记录；从记录页删除该项可恢复默认。仅基础消耗的日期不纳入饮食差额趋势。默认设置改变仍影响没有每日覆盖值的历史日期。
新字段使用既有记录模型，JSON/CSV 和同步通用处理。请先备份并升级所有客户端再使用新字段；保留 Client ID，不需要 release.py。旧版客户端无法识别新记录。已通过 JS 语法及 Node 计算、记录保存/删除、趋势测试；未进行真实浏览器或 Drive 联调。

## health-tracker-v1.1.11

V1.1.11 — Walking energy estimation

Overlay on V1.1.10. Manual exercise energy (including zero) takes precedence. Otherwise estimate net walking energy using 3.8 MET minus 1 MET resting, latest actual weight on or before the record date, and duration. No weight: estimate unavailable, no invented weight. No duration: zero. Estimates are derived, not stored or synced as manual records. History deletion restores auto estimation. Trends use the same calculation and include exercise-duration dates. No schema or credentials changes. No release.py needed.

## health-tracker-v1.1.10

V1.1.10 — Energy display adjustment

Overlay on V1.1.9. Missing meals/exercise count as zero for calculations only; original records remain unchanged. All four meal colors are fixed equal-width category markers, not proportional intake. Baseline remains optional. Trend includes dates with meal or exercise-energy entries, not weight-only dates. No changes to sync schema or credentials. Update all devices; no release.py needed.

## health-tracker-v1.1.9

# V1.1.9 — Health Goals & Energy Balance

覆盖 V1.1.8 对应文件，保留 js/cloud-config.js。先备份数据，所有同步设备升级后再使用新增字段；旧客户端无法识别运动消耗记录。无需运行 release.py。

- 中英文目标名称统一，原有目标数值和默认值不变。
- 新增可选额外运动消耗记录（exerciseCalories，kcal）和每日基础及日常消耗设置（dailyEnergyTarget，默认未设置）。基础消耗包括食物热效应，不含另计运动。
- 每日能量卡片显示已记录摄入、摄入目标、估计消耗及差额。四类饮食和运动消耗必须明确记录（无则填0），且基础消耗已设置，才显示差额。历史数据不会自动填零。
- 趋势保留原有摄入图，并增加完整日摄入与预计消耗双柱图及完整日平均差额；历史估算使用当前基础消耗设置，改变设置会重算历史估算。
- 原有记录格式、存储键、同步协议和缓存机制保留。旧云端备份/修订缺少新增目标时按 null 读取；显式恢复旧备份的所有目标时该项会清空。新字段可通过原有 JSON 记录导入导出和 CSV 导出保存，云端备份包含目标；本地 JSON 原有行为仍仅导出记录。未新增 CSV 导入。
- 未增加自动 BMR/TDEE 估算、Apple Health 连接、历史修订清理。

测试：Node 语法检查；能量公式、缺失/零值、趋势范围、旧备份/修订兼容、非法目标拒绝、新字段本地保存与导入、三方合并和冲突选择、目标保存及语言单位断言通过。尚未实际验证浏览器视觉、Google Drive 跨设备同步、CSV 下载界面。

## health-tracker-v1.1.8

# V1.1.8 — 同步诊断与云端检查点
基于 V1.1.7 更新包。覆盖对应文件，保留原有 cloud-config.js、config.js、release.py 和其他资源。无需再次运行 release.py。

- 设置 → 云端数据同步 → 同步诊断（默认折叠）。展示本次会话最近一次同步实际耗时、查询模式、修订下载和缓存命中次数、检查点下载和创建、持久缓存写入情况。次数是整个同步过程累计值，可能包含写入后再次检查；不是独立文件数量。耗时不含之后的自动备份，手动同步含用户选择等待时间。
- 云端独立 health-checkpoint.json：至少20个修订时，按需生成完整修订图包，最新检查点至少7天后才再创建；会话内最多每小时检查一次（重新授权会重置）。上限1200万 JSON 字符。新设备或空缓存优先尝试最近3个检查点；仅复用 ID 和版本与当前云端索引相符的修订，缺失或变更仍单独下载。图验证失败时重新下载原始修订。检查点并不替代权威修订或独立备份。
- 不删除云端历史文件，不改变原有合并规则、授权和 UI 布局。不做真正的历史压缩；全量索引、完整图计算和数据大小仍会增长。检查点减少请求次数，未必减少传输字节。超过上限仍回退旧流程。
- 测试：全部 JS 语法检查，7项纯函数断言（检查点版本过滤、格式、重复 ID、分支、缺失父节点、增量模式、回退模式）。未进行真实 Drive、浏览器、IndexedDB 或完整同步端到端测试。

验收：先导出 JSON；覆盖后检查 V1.1.8。连接 Drive 后同步，展开诊断，刷新再授权并同步；无修改时观察增量模式、修订下载次数。手机修改后检查电脑同步，测试冲突和备份。修订不足20个时没有检查点属于正常行为。不要为了测试删除真实历史。

## health-tracker-v1.1.7

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

## health-tracker-v1.1.5

# V1.1.5 — UI & Sync Performance

## 安装
先导出健康记录，保留当前项目的 Git 提交。将 ZIP 内文件覆盖至项目根目录。保留原有 js/cloud-config.js、js/config.js、release.py 及其他未包含文件。版本号已更新至 1.1.5，无需再次运行 release.py。

## 更新内容
- 统一浅灰面板，品牌图标与同步状态并排靠右；紧凑导航及日期行；卡片标题字重 600。保留原有手机底部导航、数字与单位、目标和图表。
- 内部导航及日期切换不再主动安排同步；保存操作仍会安排 2.5 秒延迟同步。焦点/可见性检查至少间隔 60 秒；周期检查保留。
- 当前授权会话内缓存已验证的不可变修订。每次仍获取分页文件列表，只下载未缓存的文件；重新授权或刷新后重新建立缓存。无变化且只有一个云端头时，不上传、不改写本地健康记录。
- 同步前后仍检查本地修改；发现变化时中止应用旧结果并安排重试。自动同步仍会避开正在编辑的表单。手动冲突处理继续保留。
- 自动备份列表检查在同一授权会话、同一备份周期设置下最多每 5 分钟重复一次（失败可重试）。不删除任何历史文件。

## 测试与限制
Node 模拟 Drive 测试通过：首次上传、无变化快速路径、仅下载新增文件、缓存清空后重建、同步期间本地编辑保护、备份检查节流。JS 语法检查通过。浏览器测试被运行环境的访问策略阻止，未完成实际渲染验证；真实 Google Drive 双设备测试也需在本地执行。
缓存仅存在内存中，不额外持久化健康数据或凭证。首次同步仍需要下载历史修订；文件列表仍随历史增长，尚未实现检查点或历史压缩。

## health-tracker-v1.1.4

# V1.1.4 — Sync experience

基于 V1.1.3 增量更新。覆盖 ZIP 中对应文件，保留原有 config.js、cloud-config.js、release.py、components.css 和 tokens.css。版本号已更新，无需再运行 release.py。

- 页面头部增加可点击的云端状态，进入设置查看详细信息。状态按现有自动同步引擎报告显示，不代表持续实时连接。
- 手动同步的冲突选择采用应用内 dialog，显示候选值及记录修改时间；取消停止本次同步。候选 A/B 也适用于两个云端分支。自动同步仍在冲突时暂停。
- 云端备份列表显示大小（API 有提供时）；检查后可下载独立 JSON 文件，包含健康记录及目标。不会删除任何云端文件。
- 沿用 V1.1.3 的合并规则、同步修订格式及本地同步基线；不自动覆盖未确认冲突。
- 暂未新增跨设备冲突解决标记、批量冲突选择、授权令牌持久化或自动清理。旧设备首次同步或基线不足仍可能重复询问。

验证：所有 JS 通过 Node 语法检查；异步冲突选择、取消、自动暂停和已有基线下单边修改合并通过四项模拟测试。尚未在真实浏览器及 Google Drive 上集成测试。

安装前建议独立导出数据；覆盖后打开 Localhost，连接 Google Drive，确认版本、状态、同步及备份下载，随后测试手机和电脑。满意后 git add . / git commit / git push origin main。

## health-tracker-v1.1.3

# Health Tracker V1.1.3 — Automatic Sync & Backup

基于 V1.1.2 增量更新。先导出本地 JSON，并保留已有项目文件。解压后覆盖项目根目录对应文件。不要删除原有目录或 LocalStorage。

- 自动同步默认开启：已完成首次手动同步的设备，在网页打开、联网且 Google 授权有效时，保存后约 2.5 秒触发；重新聚焦、网络恢复及定期检查也会触发。冲突时暂停，使用“立即同步”人工处理。
- 自动备份默认开启，每周一次；可选择每天、每周或每 30 天。同步成功且确认没有其他并发修订时，查询该 Google 账户最近的备份时间，达到周期后创建独立快照。两台设备同时执行可能产生额外快照，不覆盖旧文件。
- 暂不自动清理历史备份或同步修订文件。手动备份、恢复仍可用，恢复是保守合并，不会自动覆盖已存在或已删除的记录。
- 页面刷新或令牌过期后需重新连接；关闭网页不能运行后台同步。新设备首次同步仍需手动确认。同步开关、备份开关、备份频率是设备独立设置。
- 不包含 cloud-config.js，保留原来的 Client ID；不需要重新配置 Google Cloud。不修改 CSS 组件、健康数据格式、存储键或原有 release.py。
- 版本已经更新到 1.1.3，无需再次运行 release.py。

## 验收
1. Localhost 连接 Google Drive，如本设备尚未建立同步基线，先手动同步一次。
2. 保存一条测试记录，等待自动同步完成；在另一台已授权且建立基线的设备打开页面，核对新增记录。
3. 断网记录，恢复网络后确认同步。测试期间不要同时使用多个标签页修改同一数据。
4. 两台设备离线修改同一条记录，依次连接，确认冲突暂停，并通过手动同步选择版本。
5. 将备份频率改成每天（仅当上一份备份超过 24 小时，或从未备份时才触发），检查列表；切换回每周。若已有近期备份，未新增属于正常行为。
6. 确认旧备份、目标、记录、图表及语言主题仍正常，再发布 GitHub Pages。

已进行 JavaScript 语法检查及 Node 模拟授权/周期/备份/冲突分支测试。未完成真实浏览器及 Google Drive 联调。默认保留全部历史文件；90天清理规则留待后续独立验证后实现。

## health-tracker-v1.1.2

# V1.1.2 手动双向同步
覆盖此 ZIP 内的文件到现有 health-tracker 根目录。保留 js/cloud-config.js（Client ID）、现有 CSS、release.py、LocalStorage 数据。版本已更新，无需再运行 release.py。

先导出本地 JSON；建议再使用 V1.1.1 的云端备份功能。首次同步以当前设备数据为起点，旧备份不会自动导入；如需要，先恢复旧备份。再用同一个 Google 账户在另一台设备手动同步。

冲突弹窗：输入 1 或 2 选择候选值，取消则停止合并；目标也可能出现冲突。删除使用显式删除标记。同步前保存一份本地快照（health-tracker:pre-sync:v1），它不是独立导出文件。云端使用多个同名 health-sync.json 不可变修订文件，引用父修订以避免覆盖并发写入；如果提示有其他更新，请再次同步。旧 health-data.json 备份不变。暂不自动清理历史修订，不支持后台或自动同步。请勿在同步时编辑本地记录或同时在同一浏览器多个标签页编辑。

测试：新增、修改、相同值、冲突选择、取消、删除、目标、并发分支检测。真实 Google Drive 读写、并发集成、跨标签页及浏览器 UI 尚未验证。若云端缺少本设备基线，停止而不覆盖，请确认账户。首次同步前确保使用正确 Google 账户。

## health-tracker-v1.0.1

# Health Tracker V1.0.1 — 热量记录与目标

将本包内 `js/` 和 `css/` 的文件按原路径覆盖到 health-tracker 根目录。先在本地及 GitHub Pages 分别导出 JSON 备份；如有自行修改，请先比较差异。本包兼容原始 V1.0 和之前的饮食更新包，保留首页90天体重趋势。无需替换 index.html、storage.js、repository.js 或 tokens.css。

- 设置 → 每日热量目标：输入正整数 kcal 并保存；留空保存取消目标。默认未设置。目标仅保存于当前浏览器偏好，不包含在现有 JSON 记录备份中。
- 首页 → 添加记录：填写早餐、午餐、晚餐、加餐的热量；留空不修改原记录，删除请使用记录页。每日总量只统计已填写餐次，未记录不等于零。
- 今日进度环、总热量、目标与相差（实际减目标）自动计算；未设置目标或无记录时显示横线。窄屏允许目标和相差换行。
- 趋势页包含每日热量柱状图及当前参考目标线（不是历史目标）。
- 原始存储键及记录 schema 不变；饮食记录纳入原有 JSON / CSV 导出。暂未接入 OneDrive。

## 验收
1. 原有记录保留，体重趋势90天。
2. 输入四餐示例 420/650/580/200，目标2000，显示1850 kcal、93%、-150 kcal（仅测试数据）。
3. 刷新后目标和记录保留；清空目标后仍可记录饮食。
4. 检查中英文、深浅色、历史编辑删除、趋势及手机窄屏。
5. 确认无私人数据进入 git 后提交并推送。

本包经过 JS 语法检查，未完成浏览器交互验收。

注：仅收录现有归档中的更新说明；未独立复核历史测试声明。
