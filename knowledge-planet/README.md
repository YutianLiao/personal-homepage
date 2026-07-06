# Knowledge Planet（3D 知识星球）

三级结构：**一级主题 → 二级主题 → 知识点**。页面路由：`/interest-journey/knowledge-planet`。

数据源：[`data/knowledge-planet.json`](../data/knowledge-planet.json)（唯一应手改或通过脚本写入的 JSON）。`npm run dev` / `npm run build` 前会自动同步到 `docs/public/data/knowledge-planet.json`。

---

## 页面功能（当前版本）

| 区域 | 内容 |
| --- | --- |
| 左栏 | 在轨知识点计数、熟悉度图例、搜索、主题分布 TOP3、KaTeX 公式拾遗 |
| 中间 | Three.js 3D 球体：知识点光晕、球面弧线连线、四条外环星轨、远景星尘、大气壳 |
| 右栏 | 熟悉度 Top K 列表（动态 K） |
| 交互 | 拖拽旋转；点击知识点弹出详情；搜索高亮同主题连线 |

组件与脚本按需加载（`defineAsyncComponent`），仅在访问本页时加载 Three.js 与 KaTeX。

---

## 快速开始：添加知识点

### 前提：一级 / 二级主题

```bash
node scripts/knowledge-planet.mjs add-topic --title "AI" --id ai
node scripts/knowledge-planet.mjs add-subtopic --l1 ai --title "深度学习" --id deep-learning
node scripts/knowledge-planet.mjs add-subtopic --l1 ai --title "智能体" --id agent
node scripts/knowledge-planet.mjs add-subtopic --l1 ai --title "大模型" --id llm
```

### 添加单个知识点

```bash
npm run kp:add -- --l1 ai --l2 deep-learning --title "神经网络基础" --familiarity 10
```

脚本会：生成 `id` 与颜色 → 全量重算 Fibonacci 球面坐标 → 写回 JSON 并同步 public。

`familiarity`：**0–100**，越大节点越亮越大。

### 删除知识点

```bash
npm run kp:remove -- --id deep-learning-神经网络基础
```

### 仅重算球面位置

```bash
npm run kp:redistribute
```

### 手动同步 JSON

```bash
npm run sync:knowledge-planet
```

---

## 数据 Schema

```json
{
  "version": 1,
  "topics": [
    {
      "id": "ai",
      "title": "AI",
      "subtopics": [
        {
          "id": "deep-learning",
          "title": "深度学习",
          "points": [
            {
              "id": "deep-learning-神经网络基础",
              "title": "神经网络基础",
              "familiarity": 10,
              "color": "hsl(304, 65%, 58%)",
              "position": { "x": 0.4, "y": 0.92, "z": 0 },
              "url": "/optional/note-link"
            }
          ]
        }
      ]
    }
  ]
}
```

| 字段 | 说明 |
| --- | --- |
| `familiarity` | 0–100，影响节点大小与亮度 |
| `color` | 默认由 `id` 哈希生成，可手动覆盖 |
| `position` | 单位球面坐标，由 `kp:redistribute` / `kp:add` 分配 |
| `url` | 可选，详情浮层中显示外链 |

**连线规则**：同一二级主题内的知识点，以球面大圆弧相连（≤4 点全连接，>4 点相邻连接）。

---

## 命令速查

| 命令 | 作用 |
| --- | --- |
| `npm run kp:add -- --l1 <id> --l2 <id> --title "..." [--familiarity N]` | 新增知识点 |
| `npm run kp:remove -- --id <pointId>` | 删除知识点 |
| `npm run kp:redistribute` | 全量重算球面坐标 |
| `npm run sync:knowledge-planet` | 同步 JSON → `docs/public/data/` |
| `node scripts/knowledge-planet.mjs add-topic --title "..." [--id ...]` | 新增一级主题 |
| `node scripts/knowledge-planet.mjs add-subtopic --l1 <id> --title "..." [--id ...]` | 新增二级主题 |

---

## 改 UI / 视觉

| 想改什么 | 文件 |
| --- | --- |
| 三栏布局、色彩 token | `KnowledgePlanet.vue` |
| 星云背景 | `KnowledgeNebulaBg.vue` |
| 星尘、大气、渲染调度 | `sphere/createScene.ts`、`sphere/createRenderScheduler.ts` |
| 星轨（球外正圆环） | `sphere/createOrbits.ts`、`sphere/constants.ts` |
| 知识点光晕 | `sphere/createNodes.ts`、`sphere/glowTexture.ts` |
| 球面连线 | `sphere/createEdges.ts` |
| 左栏 TOP3 / 公式 | `KnowledgeLeftFill.vue` |
| 图例 / 搜索 | `KnowledgeLegend.vue`、`KnowledgeSearch.vue` |
| 点击详情 | `KnowledgePointDetail.vue` |
| 页面壳 | `docs/interest-journey/knowledge-planet.md` |
| 全页样式 | `docs/.vitepress/theme/custom.css`（`.knowledge-planet-page`） |

组件索引：[`docs/.vitepress/theme/components/knowledge-planet/README.md`](../docs/.vitepress/theme/components/knowledge-planet/README.md)

---

## 性能说明

当前实现针对「数十～数百个知识点」规模，**不会出现严重卡顿**：

- Three.js 与页面组件 **异步加载**，不影响站点其他页面
- 远景星尘约 **8,800 点**（三层 `Points`，固定像素大小，无透视暴涨）
- 渲染循环 **按需绘制**：静止时停帧；拖拽、阻尼衰减、高亮变化时再渲染
- 标签页隐藏时 **暂停渲染**
- `devicePixelRatio` 上限为 2

若未来知识点上千，可考虑：合并星尘为单层、降低轨道分段数、或对非选中节点使用 `THREE.InstancedMesh`。

---

## 开发

```bash
npm run dev
# http://localhost:5173/interest-journey/knowledge-planet
```

---

## 注意事项

- **不要手改** `docs/public/data/knowledge-planet.json`，只改 `data/knowledge-planet.json` 或用脚本
- 增删知识点后脚本会自动 `redistribute`；仅改 `familiarity` 时执行 `sync:knowledge-planet` 即可
- 星轨为球心处半径大于 `SPHERE_RADIUS` 的正圆，倾斜后透视呈椭圆，且始终位于球体外部
