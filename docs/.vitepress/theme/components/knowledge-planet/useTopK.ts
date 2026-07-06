import { computed, onMounted, onUnmounted, ref, type Ref } from "vue";

export const TOP_K_ITEM_HEIGHT = 48;

export function useTopK<T>(
  containerRef: Ref<HTMLElement | null>,
  items: Ref<T[]>
) {
  const k = ref(5);
  let observer: ResizeObserver | null = null;

  onMounted(() => {
    observer = new ResizeObserver(([entry]) => {
      const height = entry.contentRect.height;
      const usable = height * 0.8;
      k.value = Math.max(1, Math.floor(usable / TOP_K_ITEM_HEIGHT));
    });
    if (containerRef.value) observer.observe(containerRef.value);
  });

  onUnmounted(() => observer?.disconnect());

  const topItems = computed(() => items.value.slice(0, k.value));

  return { k, topItems };
}
