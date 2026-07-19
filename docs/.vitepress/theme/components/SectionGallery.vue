<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";
import { getGallerySection } from "../../gallery-sections";

const props = defineProps<{ sectionId: string }>();
const section = computed(() => getGallerySection(props.sectionId));
</script>

<template>
  <section v-if="section" class="section-gallery" :aria-labelledby="`${section.id}-gallery-title`">
    <header class="section-gallery__header">
      <p class="section-gallery__eyebrow">{{ section.eyebrow }}</p>
      <h1 :id="`${section.id}-gallery-title`">{{ section.title }}</h1>
      <p class="section-gallery__intro">{{ section.introduction }}</p>
    </header>

    <div class="section-gallery__grid">
      <a
        v-for="(item, index) in section.items"
        :key="item.link"
        class="section-gallery__item"
        :class="`section-gallery__item--${index + 1}`"
        :href="withBase(item.link)"
      >
        <figure>
          <div class="section-gallery__image-wrap">
            <img
              :src="withBase(item.cover)"
              :alt="`${item.title} 页面预览`"
              loading="lazy"
              decoding="async"
            />
            <span class="section-gallery__index" aria-hidden="true">
              {{ String(index + 1).padStart(2, "0") }}
            </span>
          </div>
          <figcaption>
            <span class="section-gallery__title">{{ item.title }}</span>
            <span class="section-gallery__description">{{ item.description }}</span>
          </figcaption>
        </figure>
      </a>
    </div>
  </section>
</template>
