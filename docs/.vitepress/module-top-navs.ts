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
  /** Return true when this section's top nav should render for the given path. */
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
    id: "learning-hub",
    match: (path) => pathMatches(path, "/learning"),
    items: [
      { type: "link", label: "Overview", href: "/learning/" },
      { type: "link", label: "Hello Agent", href: "/hello-agent/" },
      { type: "link", label: "My Notes", href: "/my-notes/" }
    ]
  },
  {
    id: "interest-journey",
    match: (path) => pathMatches(path, "/interest-journey"),
    items: [
      { type: "link", label: "Overview", href: "/interest-journey/" },
      {
        type: "link",
        label: "Learning Archive",
        href: "/interest-journey/learning-archive"
      },
      {
        type: "link",
        label: "Knowledge Planet",
        href: "/interest-journey/knowledge-planet"
      }
    ]
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

export function getModuleTopNav(path: string): ModuleTopNavSection | null {
  return moduleTopNavs.find((section) => section.match(path)) ?? null;
}
