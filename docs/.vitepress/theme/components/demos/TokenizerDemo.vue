<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { withBase } from "vitepress";
import type { BpeEncodingId, Token, TokenKind } from "./tokenizer/types";
import {
  TOKENIZER_MODULES,
  getTokenizerById,
  setBpeEncoding
} from "./tokenizer/registry";
import {
  SAMPLE_TEXTS,
  TOKEN_KIND_LABELS,
  bytesLabel,
  kindColorIndex,
  tokenDisplay
} from "./tokenizer/utils";

const inputText = ref(SAMPLE_TEXTS[0]);
const algorithmId = ref("bpe");
const bpeEncodingId = ref<BpeEncodingId>("cl100k_base");
const tokens = ref<Token[]>([]);
const loading = ref(false);
const error = ref("");
const hoveredIndex = ref<number | null>(null);
const ready = ref(false);

const mascotSrc = withBase("/decorative/demo-tokenizer.png");

const currentModule = computed(() => getTokenizerById(algorithmId.value)!);
const showBpeEncoding = computed(() => algorithmId.value === "bpe");

const stats = computed(() => {
  const text = inputText.value;
  const count = tokens.value.length;
  const chars = [...text].length;
  const unknown = tokens.value.filter(
    (t) => t.kind === "special" && t.text.includes("UNK")
  ).length;
  const ratio = count > 0 ? (chars / count).toFixed(2) : "—";
  return { chars, count, ratio, unknown };
});

const legendKinds = computed(() => {
  const kinds = new Set(tokens.value.map((t) => t.kind));
  return (Object.keys(TOKEN_KIND_LABELS) as TokenKind[]).filter((k) => kinds.has(k));
});

async function runTokenize() {
  const mod = currentModule.value;
  if (!mod) return;
  loading.value = true;
  error.value = "";
  try {
    if (mod.init) await mod.init();
    tokens.value = await mod.tokenize(inputText.value);
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
    tokens.value = [];
  } finally {
    loading.value = false;
  }
}

function loadSample() {
  const idx = Math.floor(Math.random() * SAMPLE_TEXTS.length);
  inputText.value = SAMPLE_TEXTS[idx];
}

function chipStyle(kind: TokenKind, index: number) {
  const colorIdx = kindColorIndex(kind);
  const active = hoveredIndex.value === index;
  return {
    "--chip-color": `var(--demo-token-color-${colorIdx})`,
    "--chip-bg": `var(--demo-token-bg-${colorIdx})`,
    opacity: hoveredIndex.value === null || active ? "1" : "0.45",
    transform: active ? "translateY(-2px)" : "none"
  };
}

onMounted(async () => {
  ready.value = true;
  await runTokenize();
});

watch([inputText, algorithmId, bpeEncodingId], async () => {
  if (!ready.value) return;
  if (algorithmId.value === "bpe") {
    await setBpeEncoding(bpeEncodingId.value);
  }
  await runTokenize();
});
</script>

<template>
  <div class="tokenizer-demo">
    <header class="tokenizer-demo__header">
      <div>
        <p class="tokenizer-demo__eyebrow">Interactive Demo</p>
        <h2 class="tokenizer-demo__title">Tokenizer Visualizer</h2>
        <p class="tokenizer-demo__subtitle">输入文本，选择算法，实时查看 token 切分、ID 与字节表示。</p>
      </div>
      <figure class="tokenizer-demo__mascot" aria-hidden="true">
        <img
          :src="mascotSrc"
          alt=""
          loading="lazy"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
      </figure>
    </header>

    <div class="tokenizer-demo__grid">
      <!-- Left: explanations -->
      <aside class="tokenizer-demo__panel tokenizer-demo__panel--left">
        <section class="tokenizer-demo__section">
          <h3>什么是分词器？</h3>
          <p>
            分词器（Tokenizer）把原始文本映射为离散 token 序列，再转为整数 ID 供神经网络 embedding 查表。它是 NLP
            流水线的第一道关口：切分粒度直接影响序列长度、词表大小与模型泛化。
          </p>
          <p>
            现代 LLM 多采用<strong>子词</strong>方案（BPE / WordPiece / SentencePiece），在词级语义与字符级覆盖之间折中。本
            Demo 对比从朴素空格切分到 GPT、BERT 真实词表的多种策略。
          </p>
        </section>

        <section class="tokenizer-demo__section tokenizer-demo__section--algo">
          <div class="tokenizer-demo__algo-head">
            <h3>{{ currentModule.meta.name }}</h3>
            <span class="tokenizer-demo__badge">{{ currentModule.meta.complexity }}</span>
          </div>
          <p class="tokenizer-demo__summary">{{ currentModule.meta.summary }}</p>
          <component :is="currentModule.Explanation" />
          <ul v-if="currentModule.meta.refs?.length" class="tokenizer-demo__refs">
            <li v-for="ref in currentModule.meta.refs" :key="ref.url">
              <a :href="ref.url" target="_blank" rel="noopener noreferrer">{{ ref.label }}</a>
            </li>
          </ul>
        </section>
      </aside>

      <!-- Center: input + visualization -->
      <main class="tokenizer-demo__panel tokenizer-demo__panel--center">
        <div class="tokenizer-demo__controls">
          <label class="tokenizer-demo__field">
            <span>算法</span>
            <select v-model="algorithmId">
              <option v-for="mod in TOKENIZER_MODULES" :key="mod.meta.id" :value="mod.meta.id">
                {{ mod.meta.name }}
              </option>
            </select>
          </label>

          <label v-if="showBpeEncoding" class="tokenizer-demo__field">
            <span>BPE 词表</span>
            <select v-model="bpeEncodingId">
              <option value="cl100k_base">cl100k_base (GPT-3.5/4)</option>
              <option value="o200k_base">o200k_base (GPT-4o)</option>
            </select>
          </label>

          <button type="button" class="tokenizer-demo__btn" @click="loadSample">载入示例</button>
        </div>

        <label class="tokenizer-demo__textarea-wrap">
          <span class="tokenizer-demo__label">输入文本</span>
          <textarea
            v-model="inputText"
            class="tokenizer-demo__textarea"
            rows="4"
            placeholder="输入任意文本..."
            spellcheck="false"
          />
        </label>

        <div class="tokenizer-demo__viz">
          <div class="tokenizer-demo__viz-head">
            <span class="tokenizer-demo__label">Token 可视化</span>
            <span v-if="loading" class="tokenizer-demo__status">加载词表中…</span>
          </div>

          <p v-if="error" class="tokenizer-demo__error">{{ error }}</p>

          <div v-else-if="tokens.length === 0" class="tokenizer-demo__empty">输入文本以查看 token</div>

          <div v-else class="tokenizer-demo__chips" role="list">
            <button
              v-for="(token, index) in tokens"
              :key="index"
              type="button"
              class="tokenizer-demo__chip"
              :class="`tokenizer-demo__chip--${token.kind}`"
              :style="chipStyle(token.kind, index)"
              role="listitem"
              :title="token.text"
              @mouseenter="hoveredIndex = index"
              @mouseleave="hoveredIndex = null"
              @focus="hoveredIndex = index"
              @blur="hoveredIndex = null"
            >
              <span class="tokenizer-demo__chip-text">{{ tokenDisplay(token) }}</span>
              <span v-if="token.id !== undefined" class="tokenizer-demo__chip-id">#{{ token.id }}</span>
            </button>
          </div>
        </div>
      </main>

      <!-- Right: stats + table -->
      <aside class="tokenizer-demo__panel tokenizer-demo__panel--right">
        <section class="tokenizer-demo__stats">
          <h3>统计</h3>
          <dl class="tokenizer-demo__stat-grid">
            <div>
              <dt>字符数</dt>
              <dd>{{ stats.chars }}</dd>
            </div>
            <div>
              <dt>Token 数</dt>
              <dd>{{ stats.count }}</dd>
            </div>
            <div>
              <dt>字符 / Token</dt>
              <dd>{{ stats.ratio }}</dd>
            </div>
            <div>
              <dt>未知词</dt>
              <dd>{{ stats.unknown }}</dd>
            </div>
          </dl>
        </section>

        <section v-if="legendKinds.length" class="tokenizer-demo__legend">
          <h3>图例</h3>
          <ul>
            <li v-for="kind in legendKinds" :key="kind">
              <span
                class="tokenizer-demo__legend-swatch"
                :style="{ background: `var(--demo-token-bg-${kindColorIndex(kind)})` }"
              />
              {{ TOKEN_KIND_LABELS[kind] }}
            </li>
          </ul>
        </section>

        <section class="tokenizer-demo__table-wrap">
          <h3>Token 详情</h3>
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
                  v-for="(token, index) in tokens"
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
        </section>
      </aside>
    </div>
  </div>
</template>
