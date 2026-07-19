---
name: vitepress-page-ops
description: >-
  personal-homepage(VitePress 站点)新增、修改、删除页面的标准流程与收尾清单。覆盖
  Learning 模块、Demo、Blog、Collections、Interest Journey、Knowledge Planet 与顶层单页;
  区分「内容源」与「构建产物」,处理 nav/sidebar 注册、内链、装饰资产,并在收尾时同步
  PAGE_CHECKLIST 与项目文档。当在该仓库里创建、改动、删除页面 / 路由 / 导航 / 学习模块 / Demo,
  或用户提到「加页面、改页面、删页面、加文章、加 Demo、加知识点」时使用。
---

# VitePress 页面操作(personal-homepage)

在 `personal-homepage` 这个 VitePress 站点里 **新增 / 修改 / 删除** 任何页面时遵循本流程。目标:改对「内容源」而非「构建产物」,不漏掉导航、内链与文档同步,最后能构建通过。

## 黄金法则(先记住)

1. **文档是唯一事实源,先读再动手**:仓库根 `ARCHITECTURE.md`(目录结构、注册、命令)、`README.md`(索引)、`PAGE_CHECKLIST.md`(全站页面清单)、`WRITING_CONVENTIONS.md`(文案规范)。本 skill 只是流程导航,细节以这些文档为准。
2. **区分内容源 vs 构建产物**:凡是「构建同步 / 脚本生成」的目录一律**勿手改**,改它们的**源头**再重新生成。见下表「构建产物」列。
3. **Gallery 导航要同步**:Interest Journey / Learning / Demo 的顶栏与照片总览统一读 `gallery-sections.ts`;新增或删除子页时同步该文件与 `docs/public/gallery/` 截图。Learning sidebar 由模块注册表生成,Demo sidebar 由 `demos.json` 生成。
4. **文案守规范**:正文用英文标点、`-` 列表符,细则见 `WRITING_CONVENTIONS.md`。
5. **收尾必做**:构建验证 + 同步 `PAGE_CHECKLIST.md` + 检查内链。见「收尾清单」。

## 第一步:判断页面类型

按路由前缀对号入座,决定「改哪里」和「怎么注册」:

| 页面类型 | 路由 | 内容源(改这里) | 构建产物(勿手改) | 导航 / 注册 |
| --- | --- | --- | --- | --- |
| Learning 文章 | `/hello-agent/*` | `learning/{module}/**/*.md` | `docs/{module}/` | `learning-modules.json`(模块级);sidebar/分页自动生成;Gallery 见 `gallery-sections.ts` |
| My Notes 笔记 | `/my-notes/*` | `learning/my-notes/NN-topic.md` + `index.md` | `docs/my-notes/` | `learning-modules.json` 的 `flat: true`;sidebar/分页自动生成;模块 Gallery 见 `gallery-sections.ts` |
| Demo | `/demos/*` | `demos/{id}/README.md` + `docs/demos/{id}/index.md` | — | `demos.json` + `theme/index.ts` 异步注册;Gallery 另同步 `gallery-sections.ts` |
| Interest Journey | `/interest-journey/*` | `docs/interest-journey/*.md` | Knowledge Planet 数据:`docs/public/data/`(勿手改) | Gallery / 顶栏统一读 `gallery-sections.ts`;KP 数据走脚本 |
| 分区 Gallery | `/interest-journey/`、`/learning/`、`/demos/` | 对应 `docs/**/index.md` + `gallery-sections.ts` + `docs/public/gallery/` | — | `GalleryNavGroup.vue` + `SectionGallery.vue` |
| Collections | `/collections/*` | `docs/collections/*.md` | — | **无** nav/sidebar;经 `docs/miscellaneous.md` 内链进入;右栏画像见 `doc-aside-scientists.json` |
| Blog | `/blog/*` | `docs/blog/*.md`(含 `index.md`) | — | `config.ts` 的 `nav` 与 `sidebar['/blog/']` 均**手写**,新增文章要手动加 sidebar 条目 |
| 顶层单页 | `/`、`/cv`、`/miscellaneous` | `docs/index.md`、`docs/cv.md`、`docs/miscellaneous.md` | — | `config.ts` 的 `nav` **手写** |

拿不准归属时,回到 `ARCHITECTURE.md` 的同名章节核对。

## 修改页面

1. 用上表定位**内容源**文件(不要改 `docs/{module}/` 或 `docs/public/data/` 这类产物)。
2. 编辑内容源;涉及公式用 `$`/`$$`,矩阵换行 `\\`;图片放在该分部的 `assets/`。
3. 若是 Learning 文章,改完跑 `npm run build:learning-modules` 让 `docs/` 同步。
4. 若改动涉及 Knowledge Planet 数据,用脚本(见下)而非手改 JSON。
5. 走「收尾清单」。

## 新增页面

先按类型建内容源,再补注册与导航,最后收尾。

- **Learning 文章**:在 `learning/{module}/NN-slug/` 下加 `NN-标题.md`(frontmatter 里写 `title:`);新分部需建 `NN-slug/part.json`(`{"title": "分部名"}`)。→ `npm run build:learning-modules`。sidebar 与 Prev/Next 自动生成,无需碰 `config.ts`。
- **My Notes 笔记**:在 `learning/my-notes/` 下加 `NN-topic.md`(一页是一篇完整笔记,frontmatter 写 `title:`)→ 在 `learning/my-notes/index.md` 增加 overview 链接 → `npm run build:learning-modules`。不要创建分部目录。
- **新 Learning 模块**:`learning-modules.json` 注册 `{id,title,sourceDir,route}` → 建 `learning/{id}/index.md` 及分部 → 在 `gallery-sections.ts` 加模块卡片与截图 → 构建。
- **Demo**:`demos.json` 注册 `{id,title,route,component,sourceDir}` → 建 `docs/demos/{id}/index.md` → 在 `theme/index.ts` 用 `defineAsyncComponent` 注册组件 → 在 `gallery-sections.ts` 加卡片与截图。
- **Interest Journey 页**:建 `docs/interest-journey/{slug}.md`(参考现有页设 `sidebar: false` 与 `pageClass`)→ 在 `gallery-sections.ts` 加卡片与截图。
- **Collections 页**:建 `docs/collections/{slug}.md` → 在 `docs/miscellaneous.md` 加入口内链(**这是唯一入口**)→ 如需右栏科学家素描,在 `doc-aside-scientists.json` 补映射。
- **Blog 文章**:建 `docs/blog/{YYYY-MM-slug}.md` → 在 `config.ts` 的 `sidebar['/blog/']` 手动加条目 → 视需要更新 `docs/blog/index.md` 列表。
- **顶层单页**:建 `docs/{slug}.md` → 在 `config.ts` 的 `nav` 手动加项。

## 删除页面

对称地拆掉「内容源 + 注册 + 导航 + 指向它的内链」:

1. **删内容源**:删对应源文件/目录(Learning 删 `learning/{module}/...`,其余删 `docs/...`)。
2. **同步产物**:Learning 删完跑 `npm run build:learning-modules`——脚本对当前模块执行「先删后拷」,并根据旧 sidebar 清理已退注册模块的构建目录。
3. **退注册**:整模块从 `learning-modules.json` 移除;整 Demo 从 `demos.json` 移除并删 `theme/index.ts` 注册与组件文件。
4. **清导航**:Gallery 子页从 `gallery-sections.ts` 与 `docs/public/gallery/` 移除;Blog / 顶层单页从 `config.ts` 手写 nav/sidebar 移除。
5. **清内链**:全局搜索指向该路由的链接并处理,重点 `docs/miscellaneous.md`(Collections 入口)、`docs/blog/index.md`、各页正文与 `doc-aside-scientists.json`。
6. **清资产**:删仅该页使用的 `docs/public/decorative/` 素材。
7. 走「收尾清单」。

## Knowledge Planet 数据(特例)

数据只改 `data/knowledge-planet.json`,**用脚本、勿手改 `docs/public/data/`**。详见 `knowledge-planet/README.md`。

```bash
npm run kp:add -- --l1 <id> --l2 <id> --title "..." [--familiarity N]
npm run kp:remove -- --id <pointId>
npm run kp:redistribute          # 重算球面坐标
npm run sync:knowledge-planet    # 仅同步 JSON → docs/public/data/
```

## 收尾清单(每次操作后)

复制并逐项确认:

```
- [ ] 只改了内容源,没手改构建产物(docs/{module}/、docs/public/data/)
- [ ] 新增/删除的注册已落到对应 JSON(learning-modules.json / demos.json)
- [ ] My Notes 新增/删除笔记已同步 `learning/my-notes/index.md`
- [ ] Gallery 子页已同步 `gallery-sections.ts` 与 `docs/public/gallery/` WebP 截图
- [ ] nav / sidebar 手写项已增删(Blog、顶层单页)
- [ ] 内链完整:无指向已删页面的死链;新页有入口(尤其 Collections 经 miscellaneous)
- [ ] PAGE_CHECKLIST.md 已同步增删对应路由条目
- [ ] 文案符合 WRITING_CONVENTIONS.md(英文标点、`-` 列表)
- [ ] `npm run build` 通过(会自动跑 learning / knowledge-planet / sudoku 同步)
```

## 何时更新文档与本 skill(自更新)

顺序:**先项目文档,再本 skill**。

- **每次增删页面**:必更 `PAGE_CHECKLIST.md`(它就是全站页面清单)。这是日常同步,不算改流程。
- **改了流程/约定本身**才更新文档:新增了一种页面类型、改了注册机制或目录约定、加了新脚本/命令 → 更新仓库根 `ARCHITECTURE.md`(目录、关键文件表、Agent 检查清单)与 `README.md` 索引;必要时更新 `WRITING_CONVENTIONS.md`。
- **仅当上述「流程/约定」变化后**,才回来更新本 `SKILL.md`,使「页面类型表 / 三个流程 / 收尾清单」与项目保持一致。**日常增删单个页面不要改本 skill**——否则它会和文档重复、易过时。
- 判据:如果你这次操作让「未来别人加页面的步骤」发生了变化,就更新文档(可能还有 skill);如果只是多/少了一个页面,只更 `PAGE_CHECKLIST.md`。

## 参考文档

- 目录结构 / 注册 / 命令:[`../../../ARCHITECTURE.md`](../../../ARCHITECTURE.md)
- 文档索引 / 快速开始:[`../../../README.md`](../../../README.md)
- 全站页面清单:[`../../../PAGE_CHECKLIST.md`](../../../PAGE_CHECKLIST.md)
- 文案规范:[`../../../WRITING_CONVENTIONS.md`](../../../WRITING_CONVENTIONS.md)
- Knowledge Planet:[`../../../knowledge-planet/README.md`](../../../knowledge-planet/README.md)
- 站点配置(nav/sidebar):[`../../../docs/.vitepress/config.ts`](../../../docs/.vitepress/config.ts)
