<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { useRoute, useData, withBase } from "vitepress";
import { getModuleTopNav, type ModuleTopNavItem } from "../../module-top-navs";

const route = useRoute();
const { site } = useData();
const openPart = ref<string | null>(null);
let closeTimer: ReturnType<typeof setTimeout> | null = null;

const normalizedPath = computed(() => {
  const base = site.value.base.replace(/\/$/, "");
  let p = route.path.replace(/\/$/, "") || "/";
  if (base && (p === base || p.startsWith(`${base}/`))) {
    p = p.slice(base.length) || "/";
  }
  if (p.endsWith("/index.html")) {
    p = p.replace(/\/index\.html$/, "") || "/";
  }
  return p.startsWith("/") ? p : `/${p}`;
});

const section = computed(() => getModuleTopNav(normalizedPath.value));

function normalizeHref(href: string) {
  return href.replace(/\/$/, "") || "/";
}

function isCurrent(href: string) {
  return normalizeHref(normalizedPath.value) === normalizeHref(href);
}

function isPartActive(item: Extract<ModuleTopNavItem, { type: "part" }>) {
  return item.children.some((child) => isCurrent(child.href));
}

function href(link: string) {
  return withBase(link);
}

function openPartMenu(label: string) {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  openPart.value = label;
}

function scheduleClosePartMenu() {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    openPart.value = null;
    closeTimer = null;
  }, 140);
}

function closeAfterFocus(event: FocusEvent) {
  const root = event.currentTarget as HTMLElement;
  if (!root.contains(event.relatedTarget as Node | null)) openPart.value = null;
}

onUnmounted(() => {
  if (closeTimer) clearTimeout(closeTimer);
});
</script>

<template>
  <nav
    v-if="section"
    class="module-top-nav"
    :aria-label="`${section.id} module navigation`"
  >
    <div class="module-top-nav__track">
      <template v-for="(item, index) in section.items" :key="`${item.type}-${item.label}`">
        <span v-if="index > 0" class="module-top-nav__sep" aria-hidden="true">·</span>

        <a
          v-if="item.type === 'link'"
          class="module-top-nav__link"
          :class="{ 'module-top-nav__link--active': isCurrent(item.href) }"
          :href="href(item.href)"
          :aria-current="isCurrent(item.href) ? 'page' : undefined"
        >
          {{ item.label }}
        </a>

        <div
          v-else
          class="module-top-nav__part"
          :class="{
            open: openPart === item.label,
            active: isPartActive(item)
          }"
          @mouseenter="openPartMenu(item.label)"
          @mouseleave="scheduleClosePartMenu"
          @focusin="openPartMenu(item.label)"
          @focusout="closeAfterFocus"
          @keydown.esc="openPart = null"
        >
          <button
            type="button"
            class="module-top-nav__trigger"
            :aria-expanded="openPart === item.label"
            :aria-haspopup="true"
          >
            <span>{{ item.label }}</span>
            <span class="module-top-nav__caret" aria-hidden="true">▾</span>
          </button>
          <div class="module-top-nav__menu" :aria-hidden="openPart !== item.label">
            <a
              v-for="child in item.children"
              :key="child.href"
              class="module-top-nav__item"
              :class="{ 'module-top-nav__item--active': isCurrent(child.href) }"
              :href="href(child.href)"
              :aria-current="isCurrent(child.href) ? 'page' : undefined"
            >
              {{ child.label }}
            </a>
          </div>
        </div>
      </template>
    </div>
  </nav>
</template>
