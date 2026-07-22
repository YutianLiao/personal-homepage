<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { withBase } from "vitepress";
import { useDocAsideScientist } from "../composables/useDocAsideScientist";

const { scientist } = useDocAsideScientist();

/** Keep previous portrait visible until the next one finishes decoding. */
const displaySrc = ref<string | null>(null);
const displayName = ref<string | null>(null);
const fading = ref(false);
const ready = ref(false);

const targetSrc = computed(() =>
  scientist.value ? withBase(scientist.value.image) : null
);

onMounted(() => {
  ready.value = true;
});

watch(
  [targetSrc, ready],
  ([src, isReady], _prev, onCleanup) => {
    if (!isReady) return;
    if (!src) {
      displaySrc.value = null;
      displayName.value = null;
      fading.value = false;
      return;
    }
    if (src === displaySrc.value) return;

    let cancelled = false;
    onCleanup(() => {
      cancelled = true;
    });

    const img = new Image();
    img.decoding = "async";
    img.onload = async () => {
      try {
        if (typeof img.decode === "function") await img.decode();
      } catch {
        /* decode can reject on abort; still swap if load succeeded */
      }
      if (cancelled) return;
      fading.value = true;
      displaySrc.value = src;
      displayName.value = scientist.value?.name ?? null;
      requestAnimationFrame(() => {
        if (!cancelled) fading.value = false;
      });
    };
    img.onerror = () => {
      if (cancelled) return;
      displaySrc.value = src;
      displayName.value = scientist.value?.name ?? null;
      fading.value = false;
    };
    img.src = src;
  },
  { immediate: true }
);

function hideBroken(e: Event) {
  const el = e.target as HTMLImageElement;
  el.style.display = "none";
}
</script>

<template>
  <figure
    v-if="displaySrc"
    class="site-sketch-decor site-sketch-decor--aside doc-aside-scientist"
    :class="{ 'is-swapping': fading }"
    aria-hidden="true"
  >
    <img
      class="site-sketch-decor__img"
      :src="displaySrc"
      :alt="displayName ?? ''"
      decoding="async"
      draggable="false"
      @error="hideBroken"
    />
  </figure>
</template>

<style scoped>
.doc-aside-scientist {
  width: min(100%, 9rem);
  margin-top: 1.35rem;
  transition: opacity 160ms ease;
}

.doc-aside-scientist.is-swapping {
  opacity: 0.55;
}
</style>
