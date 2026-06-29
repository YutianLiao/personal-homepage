# Site Design System

极简学术主页视觉规范。实现见 `docs/.vitepress/theme/tokens.css` 与 `custom.css`。

## 原则

- 衬线正文 + 无衬线标题/标签，留白充足
- 强调色 `--site-accent` 仅用于锚点、链接、细线
- 避免卡片堆叠、重阴影、圆角过大
- 交互态：细边框 + 浅底色 hover，不用 scale 动画

## Tokens

| 类别 | 变量 |
| --- | --- |
| 背景 | `--site-bg`, `--site-surface` |
| 文字 | `--site-text`, `--site-text-secondary`, `--site-text-muted` |
| 标题 | `--site-h1-size`, `--site-h2-size`, `--site-h3-size` |
| 布局 | `--site-page-max`, `--site-gutter`, `--site-radius` |

## 模块样式

- **章节标题 (h2)**：无衬线、斜体可选；非首个 h2 上方渐变分隔线
- **标签 (eyebrow)**：0.72rem、大写、字间距 0.1em、`--site-text-muted`
- **折叠区块**：底部分隔线、summary 行式布局、右侧 +/- 指示
- **Demo 工作台**：介绍区全宽；控件 + 可视化 + 统计纵向排列

## 反模式

- 三栏挤占说明文字
- 默认浏览器 `<details>` 灰框样式
- 彩虹渐变、emoji 装饰、Inter/Roboto 字体
