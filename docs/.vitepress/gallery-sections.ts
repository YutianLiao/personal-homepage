export type GalleryItem = {
  title: string;
  description: string;
  link: string;
  cover: string;
};

export type GallerySection = {
  id: string;
  title: string;
  link: string;
  eyebrow: string;
  introduction: string;
  activePrefixes: string[];
  items: GalleryItem[];
};

export const gallerySections: GallerySection[] = [
  {
    id: "interest-journey",
    title: "Interest Journey",
    link: "/interest-journey/",
    eyebrow: "Explore by curiosity",
    introduction: "Two ways of tracing what I am learning, collecting, and connecting.",
    activePrefixes: ["/interest-journey/"],
    items: [
      {
        title: "Learning Archive",
        description: "A curated archive of courses, books, institutions, and resources worth returning to.",
        link: "/interest-journey/learning-archive",
        cover: "/gallery/interest-journey/learning-archive.webp"
      },
      {
        title: "Knowledge Planet",
        description: "An interactive constellation of topics and ideas, arranged as a navigable 3D knowledge map.",
        link: "/interest-journey/knowledge-planet",
        cover: "/gallery/interest-journey/knowledge-planet.webp"
      }
    ]
  },
  {
    id: "learning",
    title: "Learning",
    link: "/learning/",
    eyebrow: "Build understanding",
    introduction: "Long-form learning paths and self-contained notes, written to make difficult ideas reusable.",
    activePrefixes: ["/learning/", "/hello-agent/", "/my-notes/"],
    items: [
      {
        title: "Hello Agent",
        description: "A structured path through the mathematical and algorithmic foundations of intelligent agents.",
        link: "/hello-agent/",
        cover: "/gallery/learning/hello-agent.webp"
      },
      {
        title: "My Notes",
        description: "Complete course and study notes, with one focused subject collected in each Markdown document.",
        link: "/my-notes/",
        cover: "/gallery/learning/my-notes.webp"
      }
    ]
  },
  {
    id: "demos",
    title: "Demo",
    link: "/demos/",
    eyebrow: "Learn by interaction",
    introduction: "Small interactive laboratories for seeing algorithms and systems behave.",
    activePrefixes: ["/demos/"],
    items: [
      {
        title: "Tokenizer Visualizer",
        description: "Compare tokenization algorithms and inspect tokens, IDs, byte values, and vocabulary behavior.",
        link: "/demos/tokenizer/",
        cover: "/gallery/demos/tokenizer.webp"
      },
      {
        title: "Sudoku Lab",
        description: "A focused Sudoku arena with multiple puzzle banks, timing, records, and local progress.",
        link: "/demos/sudoku/",
        cover: "/gallery/demos/sudoku.webp"
      }
    ]
  }
];

export function getGallerySection(id: string): GallerySection | undefined {
  return gallerySections.find((section) => section.id === id);
}
