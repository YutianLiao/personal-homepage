<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { loadLetterMarkdown, resolveLetterKey } from "./letterRegistry";
import { renderLetterMarkdown } from "./letterMarkdown";
import type { MapNode } from "./graphModel";
import { playLetterClose } from "./useGraphSound";

const props = defineProps<{
  node: MapNode | null;
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const loading = ref(false);
const markdown = ref("");
const error = ref("");

const html = computed(() => (markdown.value ? renderLetterMarkdown(markdown.value) : ""));

watch(
  () => [props.open, props.node?.id] as const,
  async ([open, id]) => {
    if (!open || !props.node || props.node.kind !== "entry" || !props.node.entry) {
      markdown.value = "";
      error.value = "";
      return;
    }

    loading.value = true;
    error.value = "";
    const key = resolveLetterKey(
      props.node.domainId,
      props.node.topicId!,
      props.node.entry
    );

    try {
      const content = await loadLetterMarkdown(key);
      if (!content) {
        error.value = `未找到信件文件：knowledge-letters/${key}.md`;
        markdown.value = "";
      } else {
        markdown.value = content;
      }
    } catch {
      error.value = "信件加载失败，请稍后重试。";
      markdown.value = "";
    } finally {
      loading.value = false;
    }
  },
  { immediate: true }
);

function onClose() {
  playLetterClose();
  emit("close");
}

function onBackdrop(e: MouseEvent) {
  if (e.target === e.currentTarget) onClose();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="apple-letter">
      <div
        v-if="open && node"
        class="apple-letter-backdrop"
        role="dialog"
        aria-modal="true"
        :aria-label="`${node.label} 信件`"
        @click="onBackdrop"
      >
        <article class="apple-letter" @click.stop>
          <button type="button" class="apple-letter__back" aria-label="返回图谱" @click="onClose">
            <span aria-hidden="true">←</span>
            返回
          </button>

          <header class="apple-letter__header">
            <p class="apple-letter__seal" aria-hidden="true">∎</p>
            <h2 class="apple-letter__title">{{ node.label }}</h2>
            <p v-if="node.entry?.learnedAt" class="apple-letter__date">{{ node.entry.learnedAt }}</p>
            <p v-if="node.entry?.note" class="apple-letter__note">{{ node.entry.note }}</p>
          </header>

          <div v-if="loading" class="apple-letter__loading">展开信件中…</div>
          <div v-else-if="error" class="apple-letter__error">
            <p>{{ error }}</p>
            <p class="apple-letter__hint">
              在 <code>docs/.vitepress/knowledge-letters/{{ node.domainId }}/{{ node.topicId }}/{{ node.entry?.id }}.md</code> 创建 Markdown 即可。
            </p>
          </div>
          <div v-else class="apple-letter__body vp-doc" v-html="html" />
        </article>
      </div>
    </Transition>
  </Teleport>
</template>
