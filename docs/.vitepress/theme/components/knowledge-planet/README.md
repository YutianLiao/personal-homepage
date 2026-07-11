# Knowledge Planet 组件

页面壳：[`docs/interest-journey/knowledge-planet.md`](../../../interest-journey/knowledge-planet.md)  
数据与维护指南：[`knowledge-planet/README.md`](../../../../../../knowledge-planet/README.md)

## 目录结构

```
knowledge-planet/
├── KnowledgePlanetLoader.vue   # 异步入口（theme 注册）
├── KnowledgePlanet.vue         # 三栏全屏布局 + 设计 token
├── KnowledgeNebulaBg.vue       # CSS 星云（冷暖对撞色）
├── KnowledgeLegend.vue         # 在轨计数 + 熟悉度图例
├── KnowledgeSearch.vue         # 搜索高亮
├── KnowledgeLeftFill.vue         # TOP5 主题分布（条目均分高度）+ KaTeX 公式
├── KnowledgeTopList.vue        # 熟悉度 Top K
├── KnowledgePointDetail.vue    # 点击知识点详情浮层
├── KnowledgeSphere.vue         # Three.js 主场景 + 交互
├── useKnowledgeData.ts         # 加载 public JSON
├── useTopK.ts                  # 右栏动态 K
├── types.ts
└── sphere/
    ├── constants.ts            # SPHERE_RADIUS
    ├── createScene.ts          # 相机、星尘、大气
    ├── createOrbits.ts         # 球外四条星轨 + 大气壳
    ├── createNodes.ts          # 知识点 Sprite 光晕
    ├── createEdges.ts          # 球面弧线连线
    ├── createRenderScheduler.ts # 按需渲染
    └── glowTexture.ts            # 圆点 / 光晕贴图
```

## 数据流

`data/knowledge-planet.json` →（`npm run sync:knowledge-planet`）→ `docs/public/data/knowledge-planet.json` → `useKnowledgeData` fetch

## 注册

`docs/.vitepress/theme/index.ts`：

```ts
app.component("knowledge-planet", defineAsyncComponent(() => import("./components/knowledge-planet/KnowledgePlanetLoader.vue")));
```
