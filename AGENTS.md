# 如序 · Morrow（Health Tracker）— AI Agent 开发交接与复现规范

**基线：V1.2.0 | 2026-11-27 | 下一阶段：V1.3.0 PWA**

## 0. 阅读顺序和交付契约

本文件供任何接手的 AI Agent 或开发者使用。先阅读全文，再检查当前仓库根目录的真实实现（历史交接包的 `source/` 仅作存档）。源代码是复现当前行为的权威依据，本文是架构、约束、测试与后续开发规范；不能用聊天中的设计示意图代替实际 CSS。用户真实 GitHub 仓库未在本次交接中直接读取，附件是由用户原始项目 ZIP、V1.1.0 更新包和 V1.1.12 累积更新包及 V1.1.13 UI 增量重建的基线，不保证包含用户后来私下修改的内容。未包含真实健康数据、账户令牌或实际 Client ID。若已有用户仓库，先比较差异，不可盲目覆盖。

Agent 工作原则：先识别版本与实际文件；小步改动；不擅自改已有 UI、数据格式、算法或同步协议；修改跨模块字段时完整追踪保存、校验、备份、同步、导出、趋势、翻译；先测试再打包；每次报告改动文件、实际测试、未验证事项、风险、回滚方法。不得以设计预览冒充运行截图，不得以模拟测试冒充真实 Drive 测试。不得删除用户数据或真实云端历史用于测试。用户提出的明确新需求优先于本文，但兼容性变化必须说明。

## 1. 产品定位与范围

个人健康日记，静态单页 Web App，中文/English，手机及桌面。GitHub Pages 是正式环境；localhost 是开发环境，测试数据应隔离，不建议连接正式 Drive。无需自建后端、付费数据库、npm 构建或第三方 UI 框架。Vanilla HTML、CSS、ES modules、原生 SVG、LocalStorage、IndexedDB、Google Identity Services (GIS) 与 Drive REST API v3。Python 只用于本地静态服务和版本脚本。无账户也可以录入和查看；网络与云端非核心记录的前置条件。V1.1.13 尚无 manifest/service worker/离线冷启动保证。

核心功能：体重、运动时长、饮水、睡眠、早餐/午餐/晚餐/加餐热量、每日基础及日常消耗覆盖、手动额外运动消耗、步行自动估算、每日能量差额、健康目标、趋势、历史编辑删除、本地导入导出、Google Drive 双向同步、冲突解决、完整备份、增量查询、持久缓存、检查点、诊断。

## 2. 运行、部署与版本管理

在 `source/` 根目录执行 `python -m http.server 8000`，浏览器打开 `http://localhost:8000/`；不要用 file:// 加载 ES modules。部署到 GitHub Pages 的项目子路径，所有静态资源使用相对路径（不是 `/js/...`）。实际 GitHub URL、OAuth Client ID 由用户提供，不猜测。Google Cloud 启用 Drive API；外部 OAuth consent testing 时加入测试 Gmail；创建 Web application OAuth client；Authorized JavaScript origins 为 `http://localhost:8000`、`https://<username>.github.io`（不含仓库路径和末尾斜杠）；GIS token flow 不需要 redirect URI。配置 `js/cloud-config.js` 的 `GOOGLE_CONFIG.clientId`，scope 固定 `https://www.googleapis.com/auth/drive.appdata`。Client ID 是公开客户端标识，不是 Client Secret；绝不在静态页面放 secret/refresh token。首次连接须用户操作，授权后测试接口，首次手动同步确认。不同浏览器 origin 的本地数据与缓存独立。

`version.json`、设置页 `/* release-version */` 行、index HTML 与全部本地 JS/CSS/SVG 引用的 `?v=X.Y.Z` 同步更新。`python release.py status` 查看；`python release.py patch|minor|major` 或 `python release.py 1.2.0` 更新；脚本检查引用目标存在，拒绝降级。已升好版本的更新包不重复运行 patch。保留现有 Client ID；更新包原则上排除 cloud-config.js。发布前 JSON 备份及 Git commit/tag，review diff 后 `git push origin main`（实际分支按仓库）。发布后检查版本及强刷，切勿为更新而清除网站数据。未来 PWA 需扩展脚本以同步 manifest/SW 缓存版本。

## 3. 文件地图

| 文件 | 职责 |
|---|---|
| index.html | App shell、viewport、favicon、CSS、GIS async、模块入口 |
| js/app.js | applyPreferences、createRepository、mountUI；顶层错误处理 |
| js/config.js | schema、tracker/target 定义、localDate/validDate/validTarget |
| js/storage.js | LocalStorage 适配器，读取/写入错误显式传播 |
| js/repository.js | normalize、串行 mutation、list/get/save/remove、保守导入、applySync |
| js/i18n.js + locales/{zh-CN,en}.js | 双语、主题、目标、单位/日期格式 |
| js/ui.js | 四个页面、表单、图表组装、能量卡、状态与编辑保护 |
| js/energy.js | dailyEnergy、energySeries 纯计算 |
| js/charts.js | 原生 SVG、ResizeObserver、MutationObserver 清理 |
| js/cloud-config.js / google-auth.js | Client ID/scope、GIS token 生命周期 |
| js/google-drive.js | Drive list/download/upload/about/changes/checkpoints |
| js/cloud-backup.js | 完整备份校验、比较、恢复目标 |
| js/sync.js / sync-state.js | 修订图、三方合并、同步基线、安全快照、诊断 |
| js/revision-store.js | IndexedDB 持久缓存、Changes API 增量索引 |
| js/auto-sync.js / cloud-panel.js | 调度、自动备份、云端设置/诊断 |
| js/conflict-dialog.js | 应用内候选 A/B 选择 |
| css/tokens.css | 全局颜色、字号、间距、主题变量 |
| css/base.css / layout.css / components.css | 基础样式、响应式布局、组件 |
| css/sync-ui.css | 同步状态、冲突、紧凑布局、移动端溢出修正、能量卡 |
| css/style.css | CSS imports 顺序：tokens/base/layout/components/sync-ui |
| assets/icons/app.svg | 现有品牌图标 |
| release.py / version.json | 版本管理 |

## 4. 数据模型（兼容性硬约束）

LocalStorage `health-tracker:v1`：`{"schemaVersion":1,"records":[...]}`。一日一指标一条记录，不是累加事件。日期以本地日历 YYYY-MM-DD 为准，时间戳 ISO UTC；同一天修改直接替换相同 ID；不从 UTC 日期截取作为本地今天。

```json
{"schemaVersion":1,"id":"exercise:2026-01-01","trackerId":"exercise","date":"2026-01-01","value":12,"unit":"min","updatedAt":"2026-01-01T01:00:00.000Z","deleted":false}
```

以下范围是软件校验边界，并非医学建议。

| trackerId | 单位 | min–max | UI step | 类型 |
|---|---|---|---|---|
| weight | kg | 1–500 | 0.1 | line |
| exercise | min | 0–1440 | 1 | bar |
| water | ml | 0–30000 | 1 | bar |
| sleep | h | 0–24 | 0.1 | line |
| dailyBaseline | kcal | 0–100000 | 1 | energy |
| exerciseCalories | kcal | 0–100000 | 1 | energy |
| breakfast/lunch/dinner/snack | kcal | 0–100000 | 1 | meal |
| healthyDiet | 空 | boolean | — | legacy boolean |

`normalize` 重建规范 id、unit、schemaVersion，严格验证已知 tracker、合法日期、有限数值范围或 boolean、timestamp、deleted flag；repository 不额外强制数值步进（HTML input 有 step）。未知 tracker 抛错，不静默丢弃。删除为 tombstone：保留 id、date、trackerId、unit、updatedAt，value=null、deleted=true；列表默认隐藏、备份/同步包含。缺少记录不是删除。表单留空不修改旧记录；要移除手动覆盖，必须从历史页删除该项。保存新值覆盖旧值。repository 内 Promise tail 串行写入，失败不毒化后续队列；不是跨标签页事务。applySync 比较规范化排序的当前记录与 expected，变化则拒绝覆盖。

偏好 `health-tracker:preferences`：language=zh-CN/en（默认 zh-CN），theme=system/light/dark（默认 system）。目标允许 null；设置空值清除目标。实际 V1.1.12 初始值：weightTarget=null、calorieTarget=null、dailyEnergyTarget=null、exerciseTarget=45、waterTarget=2000、sleepTarget=8。后三项已有初始值，不能误写为全部无默认值。用户始终可自行清除/修改。目标步进和范围沿用对应 tracker，最小为 step（不允许 0 目标）；dailyBaseline 记录允许显式 0。主题、语言、自动化偏好不参与云端同步；六个 target 字段参与同步。旧云端备份缺 dailyEnergyTarget 时当前兼容规则补 null；其他目标缺失则拒绝。此处的旧字段 null 与显式清除的区分是待优化风险。

## 5. 能量计算（不得更换算法而不经用户同意）

`dailyEnergy(records,date,baseline)`：
1. 取当天未删除记录；四餐缺值计算按 0，UI 显示横线或未记录，显式 0 仍是已记录，count 为数值餐次个数。intake 为四餐之和，0 餐时也是 0。
2. exerciseMinutes 缺值按 0。手动 exerciseCalories 只要是 number（包括 0）优先；否则 minutes>0 时按普通步行 3.8 MET，优先当天实际体重，若无则向过去找最近有效体重；不使用未来体重、目标体重或虚构默认体重。净运动消耗 `Math.round((3.8-1)*3.5*kg/200*minutes)`；扣除静息 1 MET，属于估算，不是精确测量。无体重而有运动时 exercise=null 并提示；无运动且无手动值时 exercise=0。估算值不写数据库。
3. dailyBaseline 若存在数值（包括 0）覆盖设置 dailyEnergyTarget；无手动值才用设置；两者缺失则 null。基础及日常消耗口径包含基础代谢、日常活动、食物热效应，不含另行记录的额外运动。手动值应与口径一致，避免重复计入运动。没有自动 BMR/TDEE 计算器。
4. output = baseline + exercise，两者都有数值才计算；balance=output-intake，正为预计缺口，负为预计盈余，0 为平衡。UI 显示绝对值及相应标签；显示来源 default/manual/walking/missingWeight/none；无 baseline 时仍独立显示运动估算。全天预计消耗与当前已记录摄入之差，不是截至当前的实际生理缺口，不提供饮食处方。
5. energySeries 仅包含有至少一餐、exerciseCalories 或 exercise 记录的日期，不能将只有体重/基础消耗的日期统计为全天零摄入。趋势以相同算法计算，缺 output 不画消耗；均值仅对 balance 非 null 的日期取平均并四舍五入。未手动覆盖的历史日期随当前默认 baseline 改变而重算，此为现状。

合成验收例：58.3 kg、12min、早餐335、午餐525、默认1100，运动估算34，总消耗1134，摄入860，预计缺口274。当天手动 baseline=1300 => 总1334、缺口474；手动 exerciseCalories=0 => 总1300、缺口440；删除手动运动记录恢复34；无默认且无手动 baseline => 总消耗/差额为 null，运动仍34。删除当天体重后使用此前最近值；没有任何历史体重且运动>0 => 不估算。

## 6. UI 与交互验收

四个导航： 首页/dashboard、趋势/trends、记录/history、设置/settings。顶部概览标题左，右侧心形品牌图标和可点击云端状态（进入设置）。紧凑统一浅灰主面板，白卡片、森林绿主按钮、天蓝 accent。深色和系统主题通过 tokens 与 data-theme；不要硬编码浅色背景到全局。桌面指标标签约20px、值40px、单位16px；移动约16/30/14px；能源卡采用独立 clamp。具体尺寸以 CSS 为准。目标文案中文用“目标”，英文 Target，不回退“参考目标”。体重显示一位小数、目标与差值（当前-目标），不设目标则提示；不绘制体重目标线。饮水存 ml、首页显示 L，其他进度条上限100%；睡眠一位小数。首页日期选取、添加记录及四项指标卡、每日能量卡、90日体重图。趋势默认7日，可选7/30/90日；体重线图默认50–65kg、5kg间隔，极端范围扩大刻度；运动/饮水柱图，睡眠线图，摄入柱图及摄入/消耗并列柱图，日均估算差额。原生 SVG 按实际宽度绘制，图高 CSS 手机160px/桌面180px；日期按真实时间轴分布，不能补虚构零值点。体重图天蓝、能量对比天蓝摄入/绿消耗。

每日能量卡两列：摄入/目标进度，预计总消耗/基础及运动来源；固定四个等宽彩色标记，始终显示（非占比图），早餐琥珀、午餐天蓝、晚餐水绿、加餐紫；四餐缺值为横线；记录数 n/4；差额区域。实际颜色和断点见 CSS。手机窄屏允许餐次网格换两列。记录编辑表单支持全部数值字段，今日基础消耗显示默认 placeholder，额外运动消耗提示留空估算；历史页按日期/指标过滤、编辑/删除确认。首页日期工具栏提供云端快捷操作（连接/立即同步/断开，按授权状态呈现，复用详细模块的操作处理函数和 busy 锁）；设置页依次为语言、主题、目标、云端控制/诊断、本地备份与版本，不重复显示顶部快捷条。首页实际顺序固定为四项指标、每日能量、90日体重趋势、习惯及记录。手机和桌面均固定底部导航；测试320/375/390/430/768及桌面宽度，长英文、文件输入、select、按钮不得溢出。使用 minmax(0,1fr)、min-width:0、max-width:100% 等已实现修正。表单未保存输入、焦点、编辑状态不得被自动同步刷新覆盖。所有新文案加入两套 locale，保留 aria/键盘/对话框焦点。

## 7. 本地与云端备份协议

本地 JSON `repo.exportBackup()` = `{schemaVersion:1,exportedAt:ISO,records:[...]}`，包含 tombstone，**不含 targets**；本地 JSON 导入只合并不存在的 id，对不同值/删除状态计 conflict，不覆盖；不恢复目标。CSV 仅导出活跃记录，UTF-8 BOM + `date,trackerId,value,unit`，当前没有 CSV 导入功能。云端 `makeBackup()` 在上述 JSON 加 `targets` 六项，校验所有记录/目标、重复 ID、时间戳。云端恢复先预览数量及冲突，确认后保守导入，目标单独确认覆盖，不能把恢复误认为双向同步。历史备份下载在检查所选备份之后可用。所有云端文件在隐藏 appDataFolder，不是普通 Drive 可见目录。

Drive 文件均为新建不可变 JSON：`health-data.json` 完整备份；`health-sync.json` 修订；`health-checkpoint.json` 加速包。禁止自动删除/覆盖历史文件，当前无清理 UI。Drive GET list 分页、`alt=media` 下载、multipart/related POST 上传至 `/upload/drive/v3/files?uploadType=multipart`；metadata parents=[appDataFolder]、mimeType=application/json。Bearer token，每次请求 cache:no-store，超时 30s（测试15s），401 清除 token。具体参数见 google-drive.js。

## 8. 授权及存储边界

GIS `initTokenClient` + `requestAccessToken({prompt:'select_account'})`，scope drive.appdata；检查 granted scopes；token 与 expiry 仅内存，过期前30秒视为失效；刷新/关闭网页后需用户重新连接；disconnect revoke 并清空内存。没有 refresh token、持久登录或关闭应用后同步。不可为方便将令牌放进 LocalStorage、IndexedDB、SW cache 或日志。

| 存储名 | 内容 |
|---|---|
| health-tracker:v1 | 真正本地记录 |
| health-tracker:preferences | 语言、主题、目标 |
| health-tracker:sync-state:v1 | `{id,at}` 上次同步修订 ID 与时间 |
| health-tracker:pre-sync:v1 | 最近一次写入前的完整安全快照 |
| health-tracker:auto:v1 | sync/backup/frequency 设备偏好 |
| IndexedDB health-tracker-revision-cache-v1 / snapshots | 持久化修订缓存、云端索引/游标，键为 Client ID + ':' + Drive user.permissionId |

缓存可重建，不是真实本地记录的替代品。当前本地记录与 sync-state 并没有账户分区，切换账户须谨慎；如果基线 ID 不在云端修订图则拒绝 sync-account，不自动重置基线。安全快照仅一份，后续可能覆盖，不能视为完整恢复保障。

## 9. 双向同步协议与算法

云端每个 Drive 文件 ID 是修订节点 ID，payload `{protocol:1,parents:[...Drive IDs],data:完整云端备份}`。每个节点保存完整状态，不是增量差分。并发上传不覆盖，形成 DAG；检查重复 parent、缺失 parent、自环、循环；拓扑遍历求 heads，迭代遍历祖先，唯一最大公共祖先作为三方 base，否则 null。多 head 按 ID 排序逐次合并，再与本地以公共祖先合并。不可改成简单 last-write-wins 或根据时间戳决定胜负。

mergePlan 语义比较：record 缺失、tombstone、实际 value 是不同语义；相同值忽略 updatedAt，目标比较实际数值/null。相同保留 local；单侧缺记录则保留另一侧（缺失不是删除）；若 base 存在且 local=base 则取 remote，remote=base 则取 local；否则冲突。目标 null 是可清除值，不使用 record 的缺失特例。冲突通过 async interactivePlan 重放纯合并计划，候选 A/B（可能是两个云端分支，不保证本地/云端），显示数值、日期/字段、时间或删除，取消终止，不提交合并结果；自动同步遇冲突抛 auto-conflict 并暂停，用户手动处理。手动同步最终确认计数。计数为记录上传/下载/相同和冲突，目标冲突也计 conflict。

syncNow：全局运行锁；捕获本地完整快照、基线和 token；加载图；校验基线；合并；确认；检查 token/canApply/本地 fingerprint（排序后的完整记录含 timestamp + targets）；若单 head 与本地 fingerprint 相同仅更新基线并结束；否则 saveSafety(local)；若合并结果等于单 head 则复用，否则先上传新节点、parents 为全部已观察 heads；上传成功后再次检查 token/canApply/fingerprint；repo.applySync(expected,merged.records)；setTargets；saveSyncState；再查图识别并发新节点，pending=true 则待后续同步。上传失败不可应用合并结果。现实现记录、目标、基线分开写，尚非原子事务；需要后续增强。缓存/检查点可在合并前独立更新，但不替换本地真实记录。

## 10. 性能与自动调度

V1.1.5 内存缓存；V1.1.7 IndexedDB+Drive Changes API；V1.1.8 检查点及诊断。`refreshIndex` 优先从已有 cursor 分页拉 changes（过滤 health-sync.json、移除 trashed/removed、文件 version 校验），成功保存 newStartPageToken；无/坏游标先取 start token，再完整 list，再重放 changes 关闭 listing race；失败退回完整 list/cursor=null。`loadGraph` 用 id+version 命中已校验修订，仅下载未缓存/版本变化者；图不合法时尝试完整重下载校验。持久缓存上限12,000,000 JSON 字符（不是精确字节数），失败安全降级。token 变更清内存，重新按账户读 IndexedDB。诊断 full/incremental/fallback；status running/done/failed；total/downloads/hits/checkpointDownloads/checkpointCreated/storage/ms/at。hits 是读取次数可超过独立文件数（可能二次 loadGraph），不是命中独立文件数；后续同步覆盖上一次诊断。

检查点 `{format:1,entries:[[id,{version,raw:{protocol:1,parents,data}}],...]}`。冷缓存且索引>=20时读最多最新3个候选，只有 id/version 匹配当前索引且校验通过的条目可复用；图不合法回退。>=20修订时每授权会话内最多每小时检查是否创建，新检查点距最近至少7天；payload <=12,000,000字符；检查点独立上传，失败非阻塞（但失效授权需报错）。不压缩/截断原始图，不删除文件。减少请求次数不代表减少历史总字节；每节点完整快照导致历史体积、缓存、CPU、冷启动成本随使用增长。不能承诺无限年限恒定性能。

自动同步默认开启，但须有效 token、首次手动同步基线、网络在线、前台可见、无编辑/dirty/焦点、非 busy/blocked。保存/删除/目标变化/导入等 debounce 2500ms；online 事件重试；focus/visibility 距上次尝试>=60s；30s timer 检查间隔>=60s；导航/日期切换不主动触发。同步期间允许本地操作，fingerprint 防止旧结果覆盖新输入；冲突/无效图/账户异常暂停，重新手动解决。非阻塞不代表所有手动操作按钮都可用，云端面板 busy 会禁用相关控件。自动备份默认每周，可选每天/7天/30天；成功且非 pending 的同步后检查；基于最新云端备份 createdTime；同 token/frequency 5分钟节流；不是独立后台定时服务。

## 11. 实际测试与风险（不得标记已解决）

历史实际验收：GitHub Pages 手机与电脑双向自动同步、冲突选择、移动端溢出修复、刷新保留记录但授权失效、V1.1.8 本地诊断增量查询（31修订、1下载、61 hits、写入成功、2.81s）。这是用户报告，不是本次复测。V1.1.12 手机布局及正式环境一般同步正常，强刷新后12min步行估算正常；旧缓存可能导致显示差异，但未证明根因。每日基础消耗新增字段的专门跨设备验收仍缺。检查点真实创建/读取、跨会话持久缓存复用、长历史实测、真实浏览器完整回归尚未确认。

Localhost 曾出现 multipart 上传 CORS/ERR_FAILED，安全快照有12min运动但缺 dailyBaseline、dailyEnergyTarget=null；GitHub Pages 后来显示12min，强刷新后估算正常。不能据此断言实际记录删除、根因是电脑限制或云端覆盖。用户选择不阻塞 PWA，但正式数据安全问题仍须记录。发生异常时断开自动同步，保存 `pre-sync`、当前记录、preferences、sync-state（不要上传真实健康数据到测试服务），检查版本、Network 请求、合并计划、tombstone 与目标差异；禁止先清缓存/反复同步。安全快照单份、账户基线、旧客户端字段、跨标签并发、非原子写入、重复冲突提示、无限修订历史均是后续风险。旧客户端无法识别新增 tracker，应全部升级，不能与旧版混合写入。不得把历史计划的 V1.1.13 修复当已实施。

## 12. 验收矩阵（每次发布必须重跑相关项目）

| ID | 测试场景 | 预期 |
|---|---|---|
| D01 | 新环境无 Google 连接录入、刷新 | 记录保持、缺失值不变、无需登录 |
| D02 | 编辑同日期同指标，删除再保存 | 唯一 id、tombstone、可重新显式保存 |
| D03 | 错误日期/未知 tracker/非法数值/重复 ID | 拒绝，不破坏本地原数据 |
| D04 | 导入旧本地 JSON/云端备份 | 旧字段兼容，冲突不静默覆盖，目标规则正确 |
| E01 | 58.3kg、12min、860摄入、1100默认 | 34运动、1134总、274缺口 |
| E02 | 手动运动0、手动基础覆盖、删除覆盖 | 显式0优先，删除恢复估算/默认 |
| E03 | 无体重/无基础/无饮食/部分餐次 | 正确 null 或0、来源说明，四餐颜色始终显示 |
| E04 | 历史日期和趋势7/30/90天 | 不使用未来体重，覆盖隔离，均值口径一致 |
| U01 | 320–430px及桌面、中英文、三主题 | 无溢出、目标文字正确、卡片/字体/图表不回归 |
| U02 | 编辑过程中触发自动同步 | 不覆盖未保存表单或新记录 |
| S01 | 两个隔离环境 A/B，首次手动同步 | 两边相同记录和目标，基线存在 |
| S02 | A修改运动/每日基础/手动运动/目标，B自动接收；反向 | 全字段一致且正确计算 |
| S03 | A/B 分别改不同指标 | 自动合并，不丢单边记录 |
| S04 | A/B 同改同指标；删除与修改冲突 | 自动暂停，手动 A/B 选择，取消不提交 |
| S05 | 上传失败、token过期、断网、请求超时 | 本地记录保留，未错误推进基线 |
| S06 | 上传期间再次本地编辑 | 不覆盖新值，重新安排同步 |
| S07 | 缺父节点/循环/错误账户/未知字段 | 拒绝同步，不修改本地 |
| P01 | 不改数据重复同步 | 增量查询，0个新修订下载（有效缓存），无额外上传 |
| P02 | 关闭重开、重新授权 | IndexedDB复用；诊断证明，非仅主观速度 |
| P03 | 新设备/坏游标/缓存不可用/检查点无效 | 安全回退，合并结果一致 |
| P04 | 20+修订且到期检查点 | 创建/冷设备读取，验证 id/version，不删除原始文件 |
| B01 | 自动备份频率/下载/恢复/目标确认 | 备份独立，不覆盖冲突，不删除历史 |
| R01 | release脚本、静态引用、GitHub子路径 | 版本一致、无404/旧模块混载，Client ID保留 |

测试用合成数据与 mock Drive；真实 OAuth 和 iPhone 测试由用户在隔离测试账号/项目执行。若没有浏览器环境，注明只做语法/逻辑测试。不要承诺测试已经通过，除非实际执行并留下结果。

## 13. 后续路线与 V1.3.0 实施约束

V1.3.0 PWA：冻结业务范围，保持数据 schema/同步协议及 UI。复用 V1.2.0 已有 manifest 与图标（相对 GitHub Pages 子路径）；注册同 scope Service Worker，HTTPS/localhost 支持；版本化本地静态 app shell 缓存，完整覆盖依赖图中的带版本 URL 与导航；不要缓存 Google OAuth/Drive API、Bearer token、用户健康数据响应；首次在线成功安装后离线冷启动，GIS 不可用时本地仍可用。不要假设安装 PWA 后 Safari 和主屏幕存储一定共享，实际验证并提供安全备份/同步迁移说明。更新策略：完整新缓存成功后提示用户，避免在编辑/同步中强制刷新，确认后 activate/reload；仅清本应用旧版本 CacheStorage，不清 LocalStorage/IndexedDB；避免混合旧新模块。离线状态明确、授权无效时等待连接，不能承诺 iOS 关闭应用时执行自动同步或 Background Sync。测试 iPhone 添加到主屏幕、桌面安装、离线重启及保存、联网重连、旧版本更新、子路径、安装失败/缓存失败。以上为未来规范，尚未实现。

V1.3.1 授权 UX：以 GIS 官方当前文档验证能力；减少用户点击与明确重授权状态，不在静态前端保存 refresh token；如果考虑后端 OAuth code flow，先征求用户同意，因为改变无服务器原则。

V1.3.2 历史管理：安全压缩/检查点协议升级，设计离线旧设备、tombstone 保留、祖先关系与回滚；未经证明不可删除任何 authoritative revision。备份与同步修订分开管理，删除必须经用户确认。

V1.3.3 安全恢复：多份安全快照、只读诊断与恢复、账户隔离、协议能力协商/旧客户端写保护、跨标签并发锁/事务、异常删除确认、真实上传失败测试、冲突解决传播优化。安全缺陷如在 PWA 验收中复现应提前修复，不必机械等待版本。

V2.0.0 远期目标：稳定发布，不是已承诺的日期或已完成版本。新增健康功能需用户确认；不引入预设减重处方、自动健康数据读取或收费服务。

## 14. 给下一位 Agent 的启动提示词

> 请接手 如序 · Morrow（Health Tracker）V1.2.0。先阅读 AGENTS.md 并检查 source/ 或用户最新 Git 仓库；以实际代码和明确用户需求为准，保留既有数据与 UI。不要将真实健康记录、token 或 Client Secret 纳入交付。先核对版本、运行环境、相关模块与回归范围，列出修改计划，再完成实际代码、测试和更新包。下一任务默认是 V1.3.0 PWA，遵守第13节；不擅自重构同步协议或删除历史。报告实际执行的测试、未验证事项、风险和部署步骤；保持中英文、移动端、旧数据兼容、版本引用一致。如果源码与本文不同，明确差异并优先保留用户现有仓库。不要只提供 UI 预览或伪造测试结果。


## V1.1.13 补充

基于 V1.1.12 更新包，仅修改 UI/交互及版本引用。详细云端模块保留；快捷按钮同一处理函数，状态与禁用逻辑共享。V1.1.12 历史验收和风险仍适用，V1.1.13 正式站点验收待完成。

本次 Node.js 模拟 DOM 测试确认快捷操作与详细操作共享处理函数及 busy 锁，授权状态切换一致；语法、版本引用、核心逻辑无变化检查通过。Chromium localhost 被环境策略拦截，真实布局及 Drive 联调未完成。

## V1.1.14 补充（优先于早期 UI 描述）

品牌固定为 Health Tracker（中英文一致），标题上方显示当前选中日期和星期，替代今日健康概览；首页日期选择器与云端快捷操作同行，使用圆角胶囊、中性色日期、绿色成功、蓝色操作及琥珀警告。云端三个模块等宽等高，触控高度至少44px，窄屏允许换行。同步结果/错误信息保留在工具栏下；运行中显示当前工作状态而非旧结果。设置快捷操作和详细模块保留，右上云图标仍进入设置。首页四项指标、每日能量、体重趋势顺序不变。复用 cloudPanel 处理函数，首页详细卡片不挂载，但快捷区域仍接收状态更新。核心同步、数据及能量算法不变。

## V1.1.15 补充（覆盖早期 UI 描述）

所有屏幕均使用固定底部四项导航（首页、趋势、记录、设置），DOM 顺序位于主内容之后，保留底部安全区和内容留白。设置页删除顶部重复的云端快捷条，保留原有完整云端模块。首页日期、快捷操作及同步反馈保持原样。业务与同步逻辑不变。

## V1.1.16 品牌规范（覆盖早期品牌描述）

正式显示名称为“如序 · Morrow”（中英文一致，使用 U+00B7 居中间隔号，左右各一空格）。首页及各页公共标题和浏览器标题统一；未来 PWA short_name 为 Morrow，尚未实现 PWA。保留现有心形心电图 SVG、森林绿和 #7CA6CD 天蓝色、固定底部导航、日期及同步工具栏、全部图表及布局。品牌理念：生活有序，未来可期。Every day shapes tomorrow. 理念仅作为品牌文档，不新增首页占位。仓库路径、LocalStorage/IndexedDB 标识、Drive 文件名及 OAuth 配置均不得改名。业务代码仅更新版本引用。

## V1.1.17 设置页品牌寄语

设置页底部在版本号后居中显示两行品牌寄语：生活有序，未来可期。 / *Every day shapes tomorrow.*；英文斜体，中英文界面一致。替换原 goalNote 页脚显示，保留健康目标设置中的其他说明。不改变首页、存储、算法或同步。

## V1.2.0 正式 Web 版（优先于旧版本规划）

用户认可 V1.1.17 为发布基线，并报告 localhost 修改经 Drive 同步到 GitHub Pages。新增 Apple touch icon、192/512 PNG、maskable PNG、manifest，沿用 app.svg 心形图案与配色；桌面简称 Morrow。release.py 增加 PNG/manifest 引用版本管理。无 Service Worker，不保证离线冷启动。V1.3.0 再实施离线缓存及更新机制。更新包不含 cloud-config.js；完整归档使用占位 Client ID。真实桌面安装、跨设备数据迁移及 OAuth 未在本次构建环境验证。
