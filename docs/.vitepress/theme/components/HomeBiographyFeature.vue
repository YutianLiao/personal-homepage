<script setup lang="ts">
import { ref, watch, computed, nextTick, onBeforeUnmount } from "vue";
import { useData } from "vitepress";
import VPFeature from "vitepress/dist/client/theme-default/components/VPFeature.vue";

/** Legacy: YAML `features[].Biography.details` unused when `bioExpanded` is set — preview comes from truncation. */
const props = defineProps<{ details?: string }>();

const { frontmatter } = useData();

const PREVIEW_CHARS = 152;

function truncatePreview(text: string, max = PREVIEW_CHARS): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (!t.length) return "";
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const cut = slice.lastIndexOf(" ");
  const core = cut > Math.floor(max * 0.55) ? slice.slice(0, cut) : slice;
  return `${core.trimEnd()}…`;
}

const open = ref(false);
const dialogRef = ref<HTMLElement | null>(null);

/** Full biography: prefers `bioExpanded`, else legacy feature `details`. */
const expandedBody = computed(() =>
  String(frontmatter.value.bioExpanded ?? props.details ?? "").trim()
);

/** Card: prefix only; dialog shows full `expandedBody`. */
const previewBody = computed(() => truncatePreview(expandedBody.value));

function close() {
  open.value = false;
}

function openIfContent() {
  if (!expandedBody.value) return;
  open.value = true;
}

function onDocumentEscape(e: KeyboardEvent) {
  if (e.key === "Escape" && open.value) close();
}

watch(open, async (isOpen) => {
  if (typeof document === "undefined") return;
  if (isOpen) {
    document.documentElement.style.overflow = "hidden";
    document.addEventListener("keydown", onDocumentEscape);
    await nextTick();
    dialogRef.value?.focus();
  } else {
    document.documentElement.style.overflow = "";
    document.removeEventListener("keydown", onDocumentEscape);
  }
});

onBeforeUnmount(() => {
  if (typeof document === "undefined") return;
  document.documentElement.style.overflow = "";
  document.removeEventListener("keydown", onDocumentEscape);
});
</script>

<template>
  <div class="home-bio-feature">
    <!-- Single interactive surface: avoid nested aria roles inside VPFeature’s root div -->
    <div
      class="home-bio-feature__hit"
      role="button"
      tabindex="0"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="home-bio-dialog"
      aria-label="Read full biography"
      @click="openIfContent"
      @keydown.enter.prevent="openIfContent"
      @keydown.space.prevent="openIfContent"
    >
      <VPFeature title="Biography" :details="previewBody" />
    </div>

    <Teleport to="body">
      <Transition name="home-bio-fade">
        <div v-if="open" class="home-bio-overlay" role="presentation">
          <div
            class="home-bio-backdrop"
            aria-hidden="true"
            @click="close"
          />
          <div
            id="home-bio-dialog"
            ref="dialogRef"
            class="home-bio-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-bio-dialog-title"
            tabindex="-1"
            @click.stop
          >
            <div class="home-bio-dialog__head">
              <h2 id="home-bio-dialog-title">Biography</h2>
              <button type="button" class="home-bio-dialog__close" @click="close">
                Close
              </button>
            </div>
            <div class="home-bio-dialog__body">{{ expandedBody }}</div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.home-bio-feature__hit {
  cursor: pointer;
  height: 100%;
}

.home-bio-feature__hit:focus-visible {
  outline: 2px solid var(--site-accent, #9f1239);
  outline-offset: 3px;
  border-radius: 8px;
}

.home-bio-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: grid;
  place-items: center;
  padding: clamp(16px, 4vw, 40px);
  box-sizing: border-box;
}

.home-bio-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(28, 25, 23, 0.4);
  backdrop-filter: blur(4px);
}

.home-bio-dialog {
  position: relative;
  z-index: 1;
  width: min(40rem, 100%);
  max-height: min(88vh, 880px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  border: 1px solid var(--site-border-strong, rgba(28, 25, 23, 0.16));
  background: var(--site-surface, #fff);
  box-shadow: var(--site-shadow-md, 0 12px 40px rgba(28, 25, 23, 0.09));
}

.home-bio-dialog__head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.15rem 0.85rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.home-bio-dialog__head h2 {
  margin: 0;
  font-family: var(--site-sans, "Source Sans 3", sans-serif);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-style: normal;
  color: var(--site-text-muted, #78716c);
}

.home-bio-dialog__close {
  flex-shrink: 0;
  font-family: var(--site-sans, "Source Sans 3", sans-serif);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--site-border-strong, rgba(28, 25, 23, 0.16));
  background: transparent;
  color: var(--site-text-secondary, #44403c);
  transition: background 0.15s ease, border-color 0.15s ease;
}

.home-bio-dialog__close:hover {
  background: var(--site-accent-soft, rgba(159, 18, 57, 0.07));
  border-color: var(--site-accent, #9f1239);
  color: var(--site-accent, #9f1239);
}

.home-bio-dialog__body {
  padding: 1.25rem 1.5rem 1.5rem;
  overflow-y: auto;
  font-family: var(--site-serif, "Source Serif 4", serif);
  font-size: var(--site-body-size, 1.0625rem);
  line-height: 1.72;
  color: var(--site-text, #1c1917);
  white-space: pre-wrap;
}

.home-bio-fade-enter-active,
.home-bio-fade-leave-active {
  transition: opacity 0.2s ease;
}

.home-bio-fade-enter-active .home-bio-dialog,
.home-bio-fade-leave-active .home-bio-dialog {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.home-bio-fade-enter-from,
.home-bio-fade-leave-to {
  opacity: 0;
}

.home-bio-fade-enter-from .home-bio-dialog,
.home-bio-fade-leave-to .home-bio-dialog {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .home-bio-fade-enter-active,
  .home-bio-fade-leave-active {
    transition: none;
  }

  .home-bio-fade-enter-active .home-bio-dialog,
  .home-bio-fade-leave-active .home-bio-dialog {
    transition: none;
  }
}
</style>
