<template>
  <div class="tokenizer-demo">
    <header class="tokenizer-demo__masthead">
      <h2 class="tokenizer-demo__title site-page-title">Tokenizer Visualizer</h2>
    </header>

    <div class="tokenizer-demo__workbench">
      <section class="tokenizer-demo__io" aria-label="分词可视化">
        <section class="tokenizer-demo__workspace-card tokenizer-demo__controls-card">
          <header class="tokenizer-demo__card-head">
            <h3 class="tokenizer-demo__card-title">算法</h3>
            <div v-if="vocabLoading" class="tokenizer-demo__vocab-load" role="status" aria-live="polite">
              <span class="tokenizer-demo__vocab-load-label">{{ vocabLoadLabel }}</span>
              <div
                class="tokenizer-demo__vocab-progress"
                role="progressbar"
                :aria-valuenow="vocabLoadProgress"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  class="tokenizer-demo__vocab-progress-bar"
                  :style="{ width: `${vocabLoadProgress}%` }"
                />
              </div>
            </div>
          </header>
          <div class="tokenizer-demo__controls">
            <label class="tokenizer-demo__field tokenizer-demo__field--select">
              <span class="tokenizer-demo__field-label">切分方式</span>
              <div class="tokenizer-demo__select-wrap">
                <select v-model="algorithmId" class="tokenizer-demo__select">
                  <option v-for="mod in TOKENIZER_META" :key="mod.id" :value="mod.id">
                    {{ mod.name }}
                  </option>
                </select>
              </div>
            </label>
            <label
              v-if="showBpeEncoding"
              class="tokenizer-demo__field tokenizer-demo__field--select"
            >
              <span class="tokenizer-demo__field-label">词表</span>
              <div class="tokenizer-demo__select-wrap">
                <select v-model="bpeEncodingId" class="tokenizer-demo__select">
                  <option value="cl100k_base">cl100k_base</option>
                  <option value="o200k_base">o200k_base</option>
                </select>
              </div>
            </label>
            <button
              type="button"
              class="tokenizer-demo__btn tokenizer-demo__btn--sample"
              :disabled="vocabLoading"
              @click="loadSample"
            >
              载入示例
            </button>
          </div>
        </section>

        <section class="tokenizer-demo__workspace-card tokenizer-demo__input-card">
          <header class="tokenizer-demo__card-head">
            <h3 class="tokenizer-demo__card-title">输入文本</h3>
            <span class="tokenizer-demo__card-meta">{{ stats.chars }} 字符</span>
          </header>
          <label class="tokenizer-demo__textarea-shell">
            <textarea
              v-model="inputText"
              class="tokenizer-demo__textarea"
              rows="6"
              aria-label="输入文本"
              placeholder="输入任意文本，实时查看 token 切分结果…"
              spellcheck="false"
              :disabled="vocabLoading"
            />
          </label>
        </section>

        <section class="tokenizer-demo__workspace-card tokenizer-demo__output-card">
          <header class="tokenizer-demo__card-head">
            <h3 class="tokenizer-demo__card-title">Token 输出</h3>
            <span class="tokenizer-demo__card-meta">{{ stats.count }} tokens</span>
          </header>
          <div class="tokenizer-demo__chips-panel">
            <p v-if="error" class="tokenizer-demo__error">{{ error }}</p>
            <div v-else-if="tokens.length === 0" class="tokenizer-demo__empty">
              <span class="tokenizer-demo__empty-icon" aria-hidden="true">⌁</span>
              <p>输入文本以查看 token</p>
            </div>
            <div v-else class="tokenizer-demo__chips" role="list">
              <button
                v-for="(token, index) in visibleChips"
                :key="index"
                type="button"
                class="tokenizer-demo__chip"
                :class="{
                  'tokenizer-demo__chip--partial': token.partialUtf8,
                  'tokenizer-demo__chip--active': hoveredIndex === index,
                  'tokenizer-demo__chip--dim': hoveredIndex !== null && hoveredIndex !== index
                }"
                :style="chipStyle(token.kind)"
                role="listitem"
                :title="token.partialUtf8 ? `bytes: ${bytesLabel(token.bytes)}` : token.text || bytesLabel(token.bytes)"
                @mouseenter="hoveredIndex = index"
                @mouseleave="hoveredIndex = null"
              >
                <span class="tokenizer-demo__chip-text">{{ tokenDisplay(token) }}</span>
                <span v-if="token.id !== undefined" class="tokenizer-demo__chip-id">#{{ token.id }}</span>
              </button>
            </div>
            <p v-if="tokensTruncated" class="tokenizer-demo__hint">
              为保持流畅，仅展示前 {{ DISPLAY_CHIP_LIMIT }} / {{ stats.count }} 个 token；完整数量见右侧统计。
            </p>
            <p v-if="stats.partialUtf8 > 0" class="tokenizer-demo__hint">
              十六进制片段为不完整 UTF-8 字节，相邻 token 拼接后还原为可读字符。
            </p>
          </div>
        </section>
      </section>

      <aside class="tokenizer-demo__inspect" aria-label="统计与详情">
        <dl class="tokenizer-demo__stat-row">
          <div class="tokenizer-demo__stat-cell">
            <dt>字符数</dt>
            <dd>{{ stats.chars }}</dd>
          </div>
          <div class="tokenizer-demo__stat-cell">
            <dt>Token 数</dt>
            <dd>{{ stats.count }}</dd>
          </div>
          <div class="tokenizer-demo__stat-cell">
            <dt>字符 / Token</dt>
            <dd>{{ stats.ratio }}</dd>
          </div>
          <div v-if="extraStat" class="tokenizer-demo__stat-cell">
            <dt>{{ extraStat.label }}</dt>
            <dd>{{ extraStat.value }}</dd>
          </div>
        </dl>

        <ul v-if="legendKinds.length" class="tokenizer-demo__legend-inline">
          <li v-for="kind in legendKinds" :key="kind">
            <span
              class="tokenizer-demo__legend-swatch"
              :style="{ background: `var(--demo-token-bg-${kindColorIndex(kind)})` }"
            />
            {{ TOKEN_KIND_LABELS[kind] }}
          </li>
        </ul>

        <div class="tokenizer-demo__table-wrap">
          <span class="tokenizer-demo__label">Token 详情</span>
          <div class="tokenizer-demo__table-scroll">
            <table class="tokenizer-demo__table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Token</th>
                  <th>ID</th>
                  <th>Bytes</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(token, index) in visibleTableRows"
                  :key="index"
                  :class="{ 'is-active': hoveredIndex === index }"
                  @mouseenter="hoveredIndex = index"
                  @mouseleave="hoveredIndex = null"
                >
                  <td>{{ index }}</td>
                  <td><code>{{ tokenDisplay(token) }}</code></td>
                  <td>{{ token.id ?? "—" }}</td>
                  <td class="tokenizer-demo__bytes">{{ bytesLabel(token.bytes) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </aside>
    </div>

    <section class="tokenizer-demo__learn" aria-label="算法说明">
      <details class="tokenizer-demo__learn-block" open>
        <summary class="tokenizer-demo__learn-summary">什么是分词器</summary>
        <div class="tokenizer-demo__learn-body site-prose">
          <p>
            神经网络只能处理数字，不能直接「阅读」字符串。分词器（Tokenizer）先把原始文本切分成
            <strong>token 序列</strong>，再根据词表将每个 token 映射成整数 ID，供 Embedding 层查表。它相当于人类语言与模型之间的编码器：同一段话，不同切分策略得到的 ID 序列长度不同，进而影响计算开销和语义粒度。
          </p>
          <h4 class="tokenizer-demo__subhead">切分策略的取舍</h4>
          <p>
            如果按<strong>单词</strong>切分，词表会随语料迅速膨胀，且大量未登录词（OOV）无法表示；如果按<strong>字符</strong>切分，词表极小，但序列会非常长。现代大模型普遍采用<strong>子词（Subword）</strong>方案，在词级与字符级之间折中——高频词保持完整，低频词被拆成可复用的词根或片段。
          </p>
          <h4 class="tokenizer-demo__subhead">常见子词算法</h4>
          <p>
            常用的子词算法有 BPE（GPT 系列）、WordPiece（BERT）和 SentencePiece（T5 / LLaMA 等）。它们都是从数据中自动学习合并规则，用小词表覆盖广泛文本。
          </p>
        </div>
      </details>

      <details v-if="currentModule" class="tokenizer-demo__learn-block" open>
        <summary class="tokenizer-demo__learn-summary">
          {{ currentModule.meta.name }}
          <span class="tokenizer-demo__badge" v-html="currentModule.meta.complexity" />
        </summary>
        <div class="tokenizer-demo__learn-body site-prose">
          <component :is="currentModule.Explanation" />
        </div>
      </details>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import type { BpeEncodingId, Token, TokenKind, TokenizerModule, VocabLoadProgress } from "./tokenizer/types";
import {
  TOKENIZER_META,
  loadTokenizerModule
} from "./tokenizer/registry";
import {
  SAMPLE_TEXTS,
  TOKEN_KIND_LABELS,
  bytesLabel,
  countLatinLetters,
  kindColorIndex,
  tokenDisplay
} from "./tokenizer/utils";

/** Cap DOM nodes so character/byte tokenization of long text does not freeze the page. */
const DISPLAY_CHIP_LIMIT = 800;
const DISPLAY_TABLE_LIMIT = 300;
const TOKENIZE_DEBOUNCE_MS = 220;
/** Soft cap before tokenize — demos stay interactive */
const INPUT_SOFT_LIMIT = 20000;

const inputText = ref(SAMPLE_TEXTS[0]);
const algorithmId = ref("whitespace");
const bpeEncodingId = ref<BpeEncodingId>("cl100k_base");
const tokens = ref<Token[]>([]);
const vocabLoading = ref(false);
const vocabLoadLabel = ref("");
const vocabLoadProgress = ref(0);
const error = ref("");
const hoveredIndex = ref<number | null>(null);
const ready = ref(false);
const currentModule = ref<TokenizerModule | null>(null);

let tokenizeRunId = 0;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const visibleChips = computed(() => tokens.value.slice(0, DISPLAY_CHIP_LIMIT));
const visibleTableRows = computed(() => tokens.value.slice(0, DISPLAY_TABLE_LIMIT));
const tokensTruncated = computed(() => tokens.value.length > DISPLAY_CHIP_LIMIT);

function handleVocabProgress(progress: VocabLoadProgress) {
  vocabLoading.value = true;
  vocabLoadLabel.value = progress.message;
  vocabLoadProgress.value = progress.progress;
}

function clearVocabLoading() {
  vocabLoading.value = false;
  vocabLoadLabel.value = "";
  vocabLoadProgress.value = 0;
}

function buildInitOptions() {
  const onVocabProgress = (progress: VocabLoadProgress) => {
    handleVocabProgress(progress);
  };
  if (algorithmId.value === "bpe") {
    return { bpeEncodingId: bpeEncodingId.value, onVocabProgress };
  }
  if (algorithmId.value === "wordpiece") {
    return { onVocabProgress };
  }
  return undefined;
}

const showBpeEncoding = computed(() => algorithmId.value === "bpe");

const stats = computed(() => {
  const text = inputText.value;
  const count = tokens.value.length;
  const chars = [...text].length;
  const latin = countLatinLetters(text);
  const partialUtf8 = tokens.value.filter((t) => t.partialUtf8).length;
  const unknown = tokens.value.filter(
    (t) => t.kind === "special" && /UNK/i.test(t.text)
  ).length;
  const ratio = count > 0 ? (chars / count).toFixed(2) : "—";
  return { chars, count, ratio, partialUtf8, unknown, latin };
});

const extraStat = computed(() => {
  if (algorithmId.value === "wordpiece") {
    return { label: "未知词 (UNK)", value: stats.value.unknown };
  }
  if (algorithmId.value === "bpe" || algorithmId.value === "byte") {
    return { label: "UTF-8 字节片段", value: stats.value.partialUtf8 };
  }
  return null;
});

const legendKinds = computed(() => {
  const kinds = new Set(tokens.value.slice(0, DISPLAY_CHIP_LIMIT).map((t) => t.kind));
  return (Object.keys(TOKEN_KIND_LABELS) as TokenKind[]).filter((k) => kinds.has(k));
});

async function runTokenize() {
  const mod = currentModule.value;
  if (!mod) return;

  const runId = ++tokenizeRunId;
  const text =
    inputText.value.length > INPUT_SOFT_LIMIT
      ? inputText.value.slice(0, INPUT_SOFT_LIMIT)
      : inputText.value;
  error.value = "";

  try {
    if (mod.init) {
      await mod.init(buildInitOptions());
    }
    if (runId !== tokenizeRunId) return;

    const result = await mod.tokenize(text);
    if (runId !== tokenizeRunId) return;
    tokens.value = result;
  } catch (e) {
    if (runId !== tokenizeRunId) return;
    error.value = e instanceof Error ? e.message : String(e);
    tokens.value = [];
  } finally {
    if (runId === tokenizeRunId) {
      clearVocabLoading();
    }
  }
}

function scheduleTokenize() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void runTokenize();
  }, TOKENIZE_DEBOUNCE_MS);
}

function loadSample() {
  const idx = Math.floor(Math.random() * SAMPLE_TEXTS.length);
  inputText.value = SAMPLE_TEXTS[idx];
}

function chipStyle(kind: TokenKind) {
  const colorIdx = kindColorIndex(kind);
  return {
    "--chip-color": `var(--demo-token-color-${colorIdx})`,
    "--chip-bg": `var(--demo-token-bg-${colorIdx})`
  };
}

async function ensureModule() {
  const mod = await loadTokenizerModule(algorithmId.value);
  currentModule.value = mod ?? null;
  return mod;
}

onMounted(async () => {
  await ensureModule();
  ready.value = true;
  await runTokenize();
});

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});

watch(algorithmId, async () => {
  tokenizeRunId += 1;
  if (debounceTimer) clearTimeout(debounceTimer);
  await ensureModule();
  if (!ready.value) return;
  await runTokenize();
});

watch([inputText, bpeEncodingId], () => {
  if (!ready.value) return;
  scheduleTokenize();
});
</script>
