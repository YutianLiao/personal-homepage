import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import helloAgentSidebar from "./hello-agent-sidebar.json";
import { transformHelloAgentPageData } from "./transformHelloAgent";

/** Note: Vite aliases do not replace the pre-bundled default `VPHomeFeatures`. Interactive Biography is injected via Layout `#home-features-before` + CSS that hides the duplicate built-in grid. */

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = repoName ? `/${repoName}/` : "/";

export default withMermaid(
  defineConfig({
  base,
  lang: "zh-CN",
  title: "Yutian Liao",
  description: "极简个人主页:研究,写作与学习记录",
  cleanUrls: true,
  appearance: false,
  transformPageData: transformHelloAgentPageData,
  markdown: {
    math: true
  },
  head: [
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap"
      }
    ]
  ],
  themeConfig: {
    outline: {
      level: [2, 3],
      label: "On this page"
    },
    nav: [
      { text: "Home", link: "/" },
      { text: "Interest Journey", link: "/interest-journey" },
      { text: "Miscellaneous", link: "/miscellaneous" },
      { text: "CV", link: "/cv" },
      { text: "Blog", link: "/blog/" },
      { text: "Hello Agent", link: "/hello-agent/" }
    ],
    sidebar: {
      "/hello-agent/": helloAgentSidebar,
      "/blog/": [
        {
          text: "Blog",
          items: [
            { text: "Index", link: "/blog/" },
            { text: "Start Here", link: "/blog/2026-05-hello-vitepress" }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/" }
    ],
    search: {
      provider: "local"
    },
    footer: {
      message: "Built with Markdown and VitePress.",
      copyright: "Copyright © 2026 Yutian Liao"
    }
  }
  })
);
