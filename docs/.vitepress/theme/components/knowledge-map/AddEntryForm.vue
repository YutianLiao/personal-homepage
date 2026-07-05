<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { KnowledgeDomain, KnowledgeMapData, PreviewEntry } from "./types";
import {
  generateEntrySnippet,
  slugify,
  todayIso,
  type GeneratedSnippet
} from "./generateEntryJson";

const props = defineProps<{
  data: KnowledgeMapData;
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
  preview: [entry: PreviewEntry | null];
}>();

const domainId = ref("ai");
const topicMode = ref<"existing" | "new">("existing");
const topicId = ref("");
const newTopicLabel = ref("");
const entryTitle = ref("");
const learnedAt = ref(todayIso());
const note = ref("");
const snippet = ref<GeneratedSnippet | null>(null);
const copyStatus = ref<"idle" | "copied" | "error">("idle");

const selectedDomain = computed(() =>
  props.data.domains.find((d) => d.id === domainId.value)
);

const topicOptions = computed(() => selectedDomain.value?.topics ?? []);

watch(domainId, () => {
  topicMode.value = topicOptions.value.length ? "existing" : "new";
  topicId.value = topicOptions.value[0]?.id ?? "";
  snippet.value = null;
  emit("preview", null);
});

watch(
  () => props.open,
  (open) => {
    if (!open) {
      snippet.value = null;
      copyStatus.value = "idle";
      emit("preview", null);
    }
  }
);

function resolvedTopicLabel(): string {
  if (topicMode.value === "new") return newTopicLabel.value.trim();
  return topicOptions.value.find((t) => t.id === topicId.value)?.label ?? "";
}

function resolvedTopicId(): string {
  if (topicMode.value === "new") return slugify(newTopicLabel.value);
  return topicId.value;
}

function validate(): string | null {
  if (!entryTitle.value.trim()) return "请填写知识点标题";
  if (topicMode.value === "new" && !newTopicLabel.value.trim()) return "请填写子主题名称";
  if (topicMode.value === "existing" && !topicId.value) return "请选择子主题";
  return null;
}

function buildPreview(): PreviewEntry | null {
  const error = validate();
  if (error) return null;

  return {
    domainId: domainId.value,
    topicId: resolvedTopicId(),
    topicLabel: resolvedTopicLabel(),
    isNewTopic: topicMode.value === "new",
    entry: {
      title: entryTitle.value.trim(),
      learnedAt: learnedAt.value || undefined,
      note: note.value.trim() || undefined
    }
  };
}

function onGenerate() {
  const error = validate();
  if (error) {
    snippet.value = null;
    return;
  }

  const domain = selectedDomain.value as KnowledgeDomain;
  const isNewTopic = topicMode.value === "new";
  const preview = buildPreview();
  if (!preview) return;

  snippet.value = generateEntrySnippet({
    domainLabel: domain.label,
    topicLabel: resolvedTopicLabel(),
    isNewTopic,
    entry: preview.entry
  });

  emit("preview", preview);
}

function onCopy() {
  if (!snippet.value) return;
  navigator.clipboard
    .writeText(snippet.value.json)
    .then(() => {
      copyStatus.value = "copied";
      setTimeout(() => {
        copyStatus.value = "idle";
      }, 2000);
    })
    .catch(() => {
      copyStatus.value = "error";
    });
}

function onDownload() {
  if (!snippet.value) return;
  const blob = new Blob([snippet.value.json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `knowledge-entry-${learnedAt.value || todayIso()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function onReset() {
  entryTitle.value = "";
  note.value = "";
  learnedAt.value = todayIso();
  snippet.value = null;
  copyStatus.value = "idle";
  emit("preview", null);
}
</script>

<template>
  <div v-if="open" class="km-add-form site-panel">
    <div class="km-add-form__head">
      <h3 class="km-add-form__title">添加知识点</h3>
      <button type="button" class="km-add-form__close" aria-label="关闭" @click="emit('close')">
        ×
      </button>
    </div>

    <div class="km-add-form__grid">
      <label class="km-add-form__field">
        <span class="km-add-form__label">领域</span>
        <select v-model="domainId" class="km-add-form__input">
          <option v-for="d in data.domains" :key="d.id" :value="d.id">{{ d.label }}</option>
        </select>
      </label>

      <label class="km-add-form__field">
        <span class="km-add-form__label">子主题</span>
        <select v-model="topicMode" class="km-add-form__input">
          <option value="existing" :disabled="!topicOptions.length">选择已有</option>
          <option value="new">新建子主题</option>
        </select>
      </label>

      <label v-if="topicMode === 'existing'" class="km-add-form__field km-add-form__field--wide">
        <span class="km-add-form__label">已有子主题</span>
        <select v-model="topicId" class="km-add-form__input">
          <option v-for="t in topicOptions" :key="t.id" :value="t.id">{{ t.label }}</option>
        </select>
      </label>

      <label v-else class="km-add-form__field km-add-form__field--wide">
        <span class="km-add-form__label">新子主题名称</span>
        <input v-model="newTopicLabel" type="text" class="km-add-form__input" placeholder="如 Deep Learning" />
      </label>

      <label class="km-add-form__field km-add-form__field--wide">
        <span class="km-add-form__label">知识点</span>
        <input v-model="entryTitle" type="text" class="km-add-form__input" placeholder="如 反向传播" required />
      </label>

      <label class="km-add-form__field">
        <span class="km-add-form__label">学习日期</span>
        <input v-model="learnedAt" type="date" class="km-add-form__input" />
      </label>

      <label class="km-add-form__field km-add-form__field--wide">
        <span class="km-add-form__label">备注（可选）</span>
        <input v-model="note" type="text" class="km-add-form__input" placeholder="简短备注" />
      </label>
    </div>

    <div class="km-add-form__actions">
      <button type="button" class="km-btn km-btn--primary" @click="onGenerate">生成 JSON</button>
      <button type="button" class="km-btn" @click="onReset">清空</button>
    </div>

    <div v-if="snippet" class="km-add-form__result">
      <p class="km-add-form__instruction">{{ snippet.instruction }}</p>
      <pre class="km-add-form__code">{{ snippet.json }}</pre>
      <div class="km-add-form__actions">
        <button type="button" class="km-btn km-btn--primary" @click="onCopy">
          {{ copyStatus === "copied" ? "已复制" : copyStatus === "error" ? "复制失败" : "复制到剪贴板" }}
        </button>
        <button type="button" class="km-btn" @click="onDownload">下载 snippet</button>
      </div>
      <p class="km-add-form__hint">
        将 JSON 粘贴到 <code>docs/.vitepress/knowledge-map.json</code> 对应位置，保存后 commit &amp; push，站点会在 GitHub Pages 重新部署后更新。
      </p>
    </div>
  </div>
</template>
