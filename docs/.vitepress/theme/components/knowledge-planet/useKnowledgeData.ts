import { ref, onMounted } from "vue";
import { withBase } from "vitepress";
import type { FlatKnowledgePoint, KnowledgePlanetData } from "./types";

function flattenData(data: KnowledgePlanetData): FlatKnowledgePoint[] {
  const result: FlatKnowledgePoint[] = [];
  for (const topic of data.topics) {
    for (const sub of topic.subtopics) {
      for (const point of sub.points) {
        result.push({
          ...point,
          l1Id: topic.id,
          l1Title: topic.title,
          l2Id: sub.id,
          l2Title: sub.title
        });
      }
    }
  }
  return result;
}

export function useKnowledgeData() {
  const loading = ref(true);
  const error = ref("");
  const points = ref<FlatKnowledgePoint[]>([]);

  onMounted(async () => {
    try {
      const url = withBase("/data/knowledge-planet.json");
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load knowledge planet: ${res.status}`);
      const data = (await res.json()) as KnowledgePlanetData;
      points.value = flattenData(data);
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  });

  return { loading, error, points };
}
