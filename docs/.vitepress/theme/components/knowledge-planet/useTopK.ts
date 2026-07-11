import { computed, onMounted, onUnmounted, ref, type Ref } from "vue";

/**
 * Stable row height in layout px (matches .km-top-list__item min-height).
 * Keep this in sync with KnowledgeTopList item chrome.
 */
export const TOP_K_ITEM_HEIGHT = 64;

const BOTTOM_SAFE_PX = 12;

export function useTopK<T>(
  containerRef: Ref<HTMLElement | null>,
  items: Ref<T[]>
) {
  const containerHeight = ref(0);
  let observer: ResizeObserver | null = null;

  function readHeight() {
    const el = containerRef.value;
    containerHeight.value = el?.clientHeight ?? 0;
  }

  onMounted(() => {
    observer = new ResizeObserver(() => {
      readHeight();
    });
    if (containerRef.value) {
      observer.observe(containerRef.value);
      readHeight();
    }
  });

  onUnmounted(() => observer?.disconnect());

  const k = computed(() => {
    const height = containerHeight.value;
    const total = items.value.length;
    if (height < 40) return total > 0 ? Math.min(1, total) : 1;
    const fit = Math.max(1, Math.floor((height - BOTTOM_SAFE_PX) / TOP_K_ITEM_HEIGHT));
    return total > 0 ? Math.min(fit, total) : fit;
  });

  const topItems = computed(() => items.value.slice(0, k.value));

  return { k, topItems };
}
