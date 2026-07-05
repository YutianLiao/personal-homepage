import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import learningSidebars from "./learning-sidebars.json";
import learningModules from "./learning-modules.json";
import demosRegistry from "./demos.json";
import { transformLearningModulePageData } from "./transformLearningModule";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = repoName ? `/${repoName}/` : "/";

const learningNavItems = learningModules.modules.map((module: { title: string; route: string }) => ({
  text: module.title,
  link: module.route
}));

const learningRoutePattern = learningModules.modules
  .map((module: { id: string }) => module.id)
  .join("|");

const demoNavItems = demosRegistry.demos.map((demo: { title: string; route: string }) => ({
  text: demo.title,
  link: demo.route
}));

const demoSidebarItems = [
  { text: "Overview", link: "/demos/" },
  ...demosRegistry.demos.map((demo: { title: string; route: string }) => ({
    text: demo.title,
    link: demo.route
  }))
];

export default withMermaid(
  defineConfig({
    base,
    lang: "zh-CN",
    title: "Yutian Liao",
    description: "极简个人主页:研究,写作与学习记录",
    cleanUrls: true,
    appearance: false,
    transformPageData: transformLearningModulePageData,
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
          text: "Interest Journey",
          activeMatch: "^/interest-journey/",
          items: [
            { text: "Learning Archive", link: "/interest-journey/learning-archive" },
            { text: "Knowledge Map", link: "/interest-journey/knowledge-map" }
          ]
        },
        { text: "Miscellaneous", link: "/miscellaneous" },
        { text: "CV", link: "/cv" },
        { text: "Blog", link: "/blog/" },
        {
          text: "Learning",
          activeMatch: `^/(${learningRoutePattern})/`,
          items: learningNavItems
        },
        {
          text: "Demo",
          activeMatch: "^/demos/",
          items: demoNavItems
        }
      ],
      sidebar: {
        "/interest-journey/": [
          { text: "Learning Archive", link: "/interest-journey/learning-archive" },
          { text: "Knowledge Map", link: "/interest-journey/knowledge-map" }
        ],
        ...learningSidebars,
        "/demos/": demoSidebarItems,
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
      socialLinks: [{ icon: "github", link: "https://github.com/" }],
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
