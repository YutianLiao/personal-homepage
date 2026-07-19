<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, withBase } from "vitepress";
import { getGallerySection } from "../../gallery-sections";

const props = withDefaults(
  defineProps<{
    sectionId: string;
    screenMenu?: boolean;
  }>(),
  { screenMenu: false }
);

const route = useRoute();
const open = ref(false);
const section = computed(() => getGallerySection(props.sectionId));
const active = computed(() => {
  const current = route.path.replace(/\/index\.html$/, "/");
  return section.value?.activePrefixes.some((prefix) => current.includes(prefix)) ?? false;
});

function closeAfterFocus(event: FocusEvent) {
  const root = event.currentTarget as HTMLElement;
  if (!root.contains(event.relatedTarget as Node | null)) open.value = false;
}
</script>

<template>
  <div
    v-if="section && !screenMenu"
    class="gallery-nav-group"
    :class="{ active, open }"
    @mouseenter="open = true"
    @mouseleave="open = false"
    @focusin="open = true"
    @focusout="closeAfterFocus"
    @keydown.esc="open = false"
  >
    <a
      class="gallery-nav-group__label"
      :href="withBase(section.link)"
      :aria-current="active ? 'page' : undefined"
      :aria-expanded="open"
    >
      {{ section.title }}
    </a>
    <div class="gallery-nav-group__menu" :aria-hidden="!open">
      <p class="gallery-nav-group__menu-eyebrow">{{ section.eyebrow }}</p>
      <a
        v-for="(item, index) in section.items"
        :key="item.link"
        class="gallery-nav-group__item"
        :href="withBase(item.link)"
      >
        <span class="gallery-nav-group__thumb">
          <img :src="withBase(item.cover)" alt="" loading="lazy" decoding="async" />
        </span>
        <span class="gallery-nav-group__item-body">
          <span class="gallery-nav-group__item-index">
            {{ String(index + 1).padStart(2, "0") }}
          </span>
          <span class="gallery-nav-group__item-title">{{ item.title }}</span>
        </span>
      </a>
    </div>
  </div>

  <div v-else-if="section" class="gallery-nav-screen">
    <a class="gallery-nav-screen__title" :href="withBase(section.link)">
      {{ section.title }}
    </a>
    <a
      v-for="item in section.items"
      :key="item.link"
      class="gallery-nav-screen__item"
      :href="withBase(item.link)"
    >
      {{ item.title }}
    </a>
  </div>
</template>
