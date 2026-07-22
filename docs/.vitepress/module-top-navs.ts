import learningSidebars from "./learning-sidebars.json";

export type ModuleTopNavChild = {
  label: string;
  href: string;
};

export type ModuleTopNavItem =
  | { type: "link"; label: string; href: string }
  | { type: "part"; label: string; children: ModuleTopNavChild[] };

export type ModuleTopNavSection = {
  id: string;
  match: (path: string) => boolean;
  items: ModuleTopNavItem[];
};

type SidebarLeaf = { text: string; link?: string; items?: SidebarLeaf[]; collapsed?: boolean };

function fromSidebar(entries: SidebarLeaf[]): ModuleTopNavItem[] {
  return entries.map((entry) => {
    if (entry.items?.length) {
      return {
        type: "part" as const,
        label: entry.text,
        children: entry.items
          .filter((child): child is SidebarLeaf & { link: string } => Boolean(child.link))
          .map((child) => ({ label: child.text, href: child.link }))
      };
    }
    return {
      type: "link" as const,
      label: entry.text,
      href: entry.link ?? "#"
    };
  });
}

function pathMatches(path: string, prefix: string): boolean {
  const normalized = path.replace(/\/$/, "") || "/";
  const base = prefix.replace(/\/$/, "") || "/";
  return normalized === base || normalized.startsWith(`${base}/`);
}

const helloAgentSidebar = (learningSidebars as Record<string, SidebarLeaf[]>)["/hello-agent/"] ?? [];
const myNotesSidebar = (learningSidebars as Record<string, SidebarLeaf[]>)["/my-notes/"] ?? [];

export const moduleTopNavs: ModuleTopNavSection[] = [
  {
    id: "hello-agent",
    match: (path) => pathMatches(path, "/hello-agent"),
    items: fromSidebar(helloAgentSidebar)
  },
  {
    id: "my-notes",
    match: (path) => pathMatches(path, "/my-notes"),
    items: fromSidebar(myNotesSidebar)
  },
  {
    id: "blog",
    match: (path) => pathMatches(path, "/blog"),
    items: [
      { type: "link", label: "Overview", href: "/blog/" },
      {
        type: "part",
        label: "Articles",
        children: [
          {
            label: "Start Here",
            href: "/blog/2026-05-hello-vitepress"
          },
          {
            label: "Warwick/SJTU Challenge",
            href: "/blog/2021-07-warwick-sjtu-challenge"
          }
        ]
      }
    ]
  }
];

/** Gallery 页用右侧子页导航；Learning 仅 Overview 除外，子页恢复 ModuleTopNav。 */
export function getModuleTopNav(path: string): ModuleTopNavSection | null {
  const normalized = path.replace(/\/$/, "") || "/";
  if (normalized === "/learning") return null;

  const isLearningModule =
    pathMatches(path, "/hello-agent") || pathMatches(path, "/my-notes");
  const isGalleryOnly =
    pathMatches(path, "/interest-journey") || pathMatches(path, "/demos");

  if (isGalleryOnly && !isLearningModule) return null;

  return moduleTopNavs.find((section) => section.match(path)) ?? null;
}
