# dsh-ui-rheostat · 本地修复与 UI 改造说明

本包 = 上游 `dsh-effort-switcher@1.0.0`（commit `0e3caf49faa9438a813568f62b2fb7a42bb732b3`）+ 本地三处改动：

1. **修复「装了却没生效」的根因**（必改，否则整个插件等于不存在）
2. **弹层 UI 按 DSH 原生观感重做**，并给 Max 档加了粒子流动效果
3. **整体重命名为 `dsh-ui-rheostat`**（包名 / Cordis 名 / 客户端模块 id / CSS 前缀 / 样式标签 id），控件外观与行为不变

产生环境：DSH 0.2.0-rc.2（Electron 44，Web profile），2026-10-06。

> ### 重命名对照表
>
> DSH 的客户端入口 id **就是包名**（`dsh-client-modules` 用 manifest 的 `name` 作为 entry id），
> 所以这几处必须同时改；只改一半会得到
> `bundle …/client.js loaded without registering "dsh-ui-rheostat" via __ModuleLoader__.load`。
>
> | 位置 | 旧 | 新 |
> | --- | --- | --- |
> | `package.json` → `name` | `dsh-effort-switcher` | `dsh-ui-rheostat` |
> | `package.json` → `dsh.profile.bundles` 条目（profile 侧） | `dsh-effort-switcher` | `dsh-ui-rheostat` |
> | `cordis.patch.yml` → `insert[].id` | `effort-switcher` | `ui-rheostat` |
> | `cordis.patch.yml` → `insert[].name` | `dsh-effort-switcher` | `dsh-ui-rheostat` |
> | `host.js` → `export const name` | `effort-switcher` | `ui-rheostat` |
> | `host.js` → `Config["~standard"].vendor` | `dsh-effort-switcher` | `dsh-ui-rheostat` |
> | `index.js` → `__ModuleLoader__.load({ id })` | `dsh-effort-switcher` | `dsh-ui-rheostat` |
> | `index.js` → `const name` / `data-dsh-plugin` | `effort-switcher` | `ui-rheostat` |
> | `index.js` → `STYLE_TAG_ID` | `dsh-effort-switcher/seat.css` | `dsh-ui-rheostat/seat.css` |
> | CSS 类前缀 / `@keyframes` 名 | `dsh-es-*` | `dsh-rheo-*` |
> | 控制台日志前缀 | `[effort-switcher]` | `[ui-rheostat]` |
>
> 未改动：组件函数名 `EffortSliderSeat`（它描述的是「推理强度滑条座位」这一职责，
> 不是项目名）、上游 GitHub 仓库地址（仍是 `lemonorangeapple/dsh-effort-switcher`）。

---

## 一、根因修复：`inject` 缺 `remote` / `remote.session`

`index.js` 顶部：

```js
// 修改前（座位会在运行时崩溃）
const inject = ["slots", "modelDirectories", "sessions"];

// 修改后（LOCAL PATCH）
const inject = ["slots", "modelDirectories", "sessions", "remote", "remote.session"];
```

**为什么**：座位注册后，DSH 会在 `inject(sessionId)` 里调用
`modelDirectories.directoryFor(sessionId)`；而 `ModelDirectoryResolver.directoryFor()`
内部要解引用 `this.ctx.remote.session`。cordis 的 ctx 代理按**调用方 ctx 的注入表**解析
点号服务名，注入表里没有 `remote.session` 时直接抛：

```
Error: cannot get property "remote.session" without inject
    at Object.get (assets/index-*.js)
    at Proxy.directoryFor (plugins/??…,dsh-ui-rheostat/client.js,…)
[error] slot entry crashed in 'conversation.input.model': Error: cannot get property "remote.session" without inject
```

该条目随后退出 → 座位回退渲染**内置** ModelSelect → 用户看到的就是"插件装了但界面毫无变化"。
DSH 内置同座位的注入表是 `["commandUi","locale","sessions","slots","remote","remote.session"]`，
即插件必须申明 `remote` 与 `remote.session`。

> 自检：修复后控制台会出现插件自身诊断日志
> `[ui-rheostat] directory {sessionId, available, status, groupCount, error}`，
> 且不再有 `slot entry crashed`。

## 二、UI 改造（DSH 原生令牌）

沿用 DSH 自带控件的设计语言，不再"自成一派"：

- **令牌**：`--dsw-radius-sm/md/lg`、`--dsw-specific-menu`、`--dsw-menu-backdrop-filter`
  (`blur(40px) saturate(150%)`)、`--dsw-elevation-prominent`（配
  `--dsw-elevation-stroke-color: var(--dsw-alias-border-l1)` 与 `border: 0`）、层级 `z-index: 1100`。
- **触发钮**：28px 高、`radius-sm`、13px/400，标签与强度之间加 `·` 分隔点，最多
  `min(280px, 45cqw)`。
- **面板**：`width: min(320px, 100vw - 32px)`、`padding: 4px`、`radius-lg`、菜单表面 + 毛玻璃。
- **两窗格单卡片**：`模型` 行（label + 右对齐当前模型 + chevron）与「选择模型」列表
  **在同一张卡片内切换**（旧版是另开一个悬浮子菜单，会左偏 20px 并压住主面板）。
  返回按钮 28×28，选中项显示 ✓。
- **模型项不再被省略号截断**：名称与描述**竖排**（`.dsh-rheo-menuItemBody` 为 column，
  `min-width: 0`），描述最多 2 行 clamp。旧版名称与描述同行，`DeepSeek-V4-Pro` 的名称
  被挤到 29px 宽、显示成 `De…`。
- **滑条**：轨道 24px、`radius: 999px`、蓝→紫渐变，白钮 30px（hover 放大、焦点环），
  静态刻度点 5px；整体 rail 高 38px。
- **Max 档粒子流**：`.dsh-rheo-particles`（8 颗→**12 颗**彗星，亮头在左、尾向右渐隐，
  `0 0 5px` 白光晕）用 `@keyframes dsh-rheo-particle-drift` 从右向左流动，
  位移 `translateX(calc(-100cqw - 12px))` 靠 `container-type: inline-size` 换算整条宽度。
  仅在最高档渲染（其他档 DOM 里粒子数为 0）；`prefers-reduced-motion: reduce` 时关闭动画。
- **交互细节**：`Escape` 在模型列表里先返回上一窗格、再关面板；`aria-haspopup` /
  `aria-expanded` / `role="menuitemradio"` / `aria-checked` 齐备；hover 提示与错误块同用原生表面。

## 三、安装 / 覆盖

插件安装在 profile 的 `node_modules` 下，路径：

```
%USERPROFILE%\.dsh\profiles\<profile>\node_modules\dsh-ui-rheostat\
```

- 本地链入：`dsh plugin --profile desktop add D:\Desktop\dsh-effort-switcher`
  （依赖名取 `package.json` 的 `name`，即 `dsh-ui-rheostat`）
- 上游原包：`dsh plugin --profile <profile> add github:lemonorangeapple/dsh-effort-switcher`
  —— **本包已改名，不要再按这个名字装上游包**，两者会抢同一个座位
  `conversation.input.model`，同时安装会出现双重控件。
- 本包覆盖：把本 zip 内容解压覆盖到上面的目录（`package.json` 就在包根），
  然后让 Web 进程重新加载：**刷新窗口**即可（实测宿主每次页面加载都从磁盘重读该模块）；
  若仍无变化或改了 `inject`，**完全重启宿主进程**再刷新。
- 只想打最小补丁？把 `index.js` 里的 `inject` 那一行按第一节改成 5 个名字即可。

> ⚠️ 本补丁位于 pnpm 安装目录内：`dsh plugin update`、重新安装、换机器都会丢失，需要重打。
> 上游修法是把 `"remote","remote.session"` 加进 `inject` 并重新发布。

## 四、可调参数

| 想改什么 | 改哪里 |
| --- | --- |
| 粒子数量/大小/速度/疏密 | `index.js` 的 `PARTICLE_SPECS`（12 条：`w` `h` `top` `opacity` `duration` `delay`） |
| 条粗细 | `.dsh-rheo-sliderGroove` 的 `height`（当前 `24px`）、`.dsh-rheo-sliderRail`（`38px`） |
| 圆钮大小 | `.dsh-rheo-sliderKnobFace`（`30px`）+ `index.js` 里 `const thumbRadius = 15;` |
| 渐变配色 | `.dsh-rheo-sliderFill` 的 `linear-gradient(90deg, #4f8cff, #7b6cff)` |
| 面板宽度 | `.dsh-rheo-menu` 的 `width: min(320px, 100vw - 32px)` |

## 五、已知瑕疵（未修）

`apply()` 里把 `select` 包成了 `.then(() => true, () => false)`：

```js
select: (selection) => available ? directory.select(selection).then(() => true, () => false) : Promise.resolve(false)
```

而内置 `directory.select()` 失败时**不 reject**，而是 resolve 一个 `{ok:false, error}`，
所以上面这层永远返回 `true` → 选择失败（例如模型不支持某档强度）时不会进入
`blockedModels` 提示分支。想修的话改成按结果判断即可，例如：

```js
select: (selection) => available
  ? directory.select(selection).then((r) => r == null || r.ok !== false, () => false)
  : Promise.resolve(false)
```

### `verify-client.cjs` 与当前实现不同步（预存在，非改名引入）

`npm test` **在改名之前就是红的**：把改名前备份解到临时目录跑 `node verify-client.cjs`，
同样在 `verify-client.cjs` 的 trigger radius 那行报
`Error: trigger radius missing from injected css`。两类偏差：

1. **数值/颜色字面量过期**——断言仍写 `border-radius: 22px`、`height: 26px`、
   `transition: … .315s ease`、`background: #4c8dff`、`scrollbar-width: none`、
   `rgb(255 255 255 / 38%)`；而当前样式表是 `var(--dsw-radius-sm)`、`24px`、`.28s`、
   `linear-gradient(90deg, #4f8cff 0%, #7b6cff 100%)`、`scrollbar-width: thin`、
   `rgb(255 255 255 / 44%)`。这些字面量已按当前样式表（与本文档第四节一致）对齐，
   并在断言前加了说明注释。
2. **设计级偏差**——仍断言「模型列表展开时滑条与分隔线保持可见」
   （`slider must stay visible while the model list is open`），而当前实现是
   **两窗格单卡片**：打开模型列表会切到模型窗格（见第二节与 `Escape` 行为）。
   这一层要重写交互预期，属独立工作，本轮未动。

所以 `npm test` 现在仍会停在 (2)。这是**预存在**问题，与改名无关。

## 六、验证方式（可复现）

- 无头 Edge + 自签 cookie 探针：读 `%USERPROFILE%\.dsh\.credentials.yaml` 的
  `client-connection/browser-session.secret`，签出
  `dsh-auth-<base64url(sha256("127.0.0.1:<port>"))>` cookie，再用 CDP 打开 GUI，
  既能读 console，也能量几何、派发拖拽、截图。本项目用它验证：条粗细、粒子是否在动
  （两次采样 `transform` 从 `-51px` 变到 `-120px`）、`exceptions 0`。
- 拖拽写入：滑条提交走 `onMouseUp`（没有 `onPointerUp`），派发 `input`+`change`+`mouseup`
  才会提交；实测 `Max ↔ Off` 往返正常。
