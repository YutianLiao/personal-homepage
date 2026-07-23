import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { transformPageData } from "./transformPageData";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = repoName ? `/${repoName}/` : "/";

export default withMermaid(
  defineConfig({
    base,
    lang: "zh-CN",
    title: "Yutian Liao",
    description: "极简个人主页:研究,写作与学习记录",
    cleanUrls: true,
    // Dev-facing README.md files (module sources, decorative asset notes) are
    // synced into docs/ but must not become public routes.
    srcExclude: ["**/README.md"],
    appearance: false,
    transformPageData,
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
          href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&family=Noto+Serif+SC:wght@400;600&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap"
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
        {
          component: "GalleryNavGroup",
          props: { sectionId: "interest-journey" }
        },
        { text: "Miscellaneous", link: "/miscellaneous" },
        { text: "CV", link: "/cv" },
        { text: "Blog", link: "/blog/" },
        {
          component: "GalleryNavGroup",
          props: { sectionId: "learning" }
        },
        {
          component: "GalleryNavGroup",
          props: { sectionId: "demos" }
        }
      ],
      /** Full-site: no left sidebar — module nav lives in ModuleTopNav. */
      sidebar: false,
      socialLinks: [{ icon: "github", link: "https://github.com/YutianLiao/personal-homepage" }],
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
