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
/** Served from docs/public/images/ … — avoid authoring `/images/` in Markdown (Vite would try to bundle it). */
const items = [
  { src: "/images/family-1.jpg", alt: "Family photo 1" },
  { src: "/images/family-2.jpg", alt: "Family photo 2" },
  { src: "/images/family-3.jpg", alt: "Family photo 3" }
];
</script>

<style scoped>
.misc-family-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(0.65rem, 2vw, 1rem);
  margin: 1.1rem 0 1.35rem;
  width: 100%;
}

.misc-family-fig {
  margin: 0;
  min-width: 0;
  overflow: hidden;
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
    max-width: 22rem;
  }
}
</style>
