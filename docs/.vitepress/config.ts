import { defineConfig } from "vitepress";

/** Note: Vite aliases do not replace the pre-bundled default `VPHomeFeatures`. Interactive Biography is injected via Layout `#home-features-before` + CSS that hides the duplicate built-in grid. */

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = repoName ? `/${repoName}/` : "/";

export default defineConfig({
  base,
  lang: "zh-CN",
  title: "Yutian Liao",
  description: "极简个人主页:研究,写作与学习记录",
  cleanUrls: true,
  appearance: false,
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
      { text: "Hello Agent", link: "/hello-agent/" },
      { text: "Miscellaneous", link: "/miscellaneous" },
      { text: "Blog", link: "/blog/" },
      { text: "CV", link: "/cv" }
    ],
    sidebar: {
      "/hello-agent/": [
        {
          text: "Hello Agent",
          link: "/hello-agent/",
          items: [
            { text: "Overview", link: "/hello-agent/" },
            {
              text: "Seq2Seq 与注意力机制",
              link: "/hello-agent/seq2seq-attention-tutorial"
            }
          ]
        }
      ],
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
});
