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
        href: "https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400&display=swap"
      }
    ]
  ],
  themeConfig: {
    outline: false,
    nav: [
      { text: "Home", link: "/" },
      { text: "Interest Journey", link: "/interest-journey" },
      { text: "Miscellaneous", link: "/miscellaneous" },
      { text: "Blog", link: "/blog/" },
      { text: "CV", link: "/cv" }
    ],
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
