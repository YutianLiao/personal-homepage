<template>
  <div class="misc-family-row" role="group" aria-label="Family photos">
    <figure v-for="(item, i) in items" :key="item.src" class="misc-family-fig">
      <img
        :src="item.src"
        :alt="item.alt ?? `Family photo ${i + 1}`"
        loading="lazy"
        decoding="async"
      />
    </figure>
  </div>
</template>

<script setup lang="ts">
import { withBase } from "vitepress";

/** Served from docs/public/images/ — paths must use withBase for GitHub Pages subpath deploy. */
const items = [
  { src: withBase("/images/family-1.jpg"), alt: "Family photo 1" },
  { src: withBase("/images/family-2.jpg"), alt: "Family photo 2" },
  { src: withBase("/images/family-3.jpg"), alt: "Family photo 3" }
];
</script>

<style scoped>
.misc-family-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(0.75rem, 2vw, 1.15rem);
  margin: 1.25rem 0 1.5rem;
  width: 100%;
}

.misc-family-fig {
  margin: 0;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--site-border, rgba(28, 25, 23, 0.09));
  border-radius: 8px;
  background: var(--site-surface, #fff);
  box-shadow: var(--site-shadow-sm, 0 1px 3px rgba(28, 25, 23, 0.05));
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.misc-family-fig:hover {
  box-shadow: var(--site-shadow-md, 0 12px 40px rgba(28, 25, 23, 0.09));
  transform: translateY(-2px);
}

.misc-family-fig img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  object-position: center top;
}

@media (max-width: 720px) {
  .misc-family-row {
    grid-template-columns: 1fr;
    max-width: 20rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .misc-family-fig {
    transition: none;
  }

  .misc-family-fig:hover {
    transform: none;
  }
}
</style>
