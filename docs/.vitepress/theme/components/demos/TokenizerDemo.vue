<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
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

const currentModule = computed(() => getTokenizerById(algorithmId.value)!);
const showBpeEncoding = computed(() => algorithmId.value === "bpe");

const stats = computed(() => {
  const text = inputText.value;
  const count = tokens.value.length;
  const chars = [...text].length;
  const partialUtf8 = tokens.value.filter((t) => t.partialUtf8).length;
  const unknown = tokens.value.filter(
    (t) => t.kind === "special" && /UNK/i.test(t.text)
  ).length;
  const ratio = count > 0 ? (chars / count).toFixed(2) : "—";
  return { chars, count, ratio, partialUtf8, unknown };
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
    transform: active ? "translateY(-1px)" : "none"
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
    <section class="tokenizer-demo__intro">
      <div class="tokenizer-demo__intro-block">
        <h2 class="tokenizer-demo__section-label">什么是分词器</h2>
        <div class="tokenizer-demo__prose">
          <p>
            神经网络只能处理数字，不能直接「阅读」字符串。分词器（Tokenizer）负责把原始文本变成
            <strong>token 序列</strong>，再映射为整数 ID，供 Embedding 层查表。可以把它理解为人类语言与模型之间的编码器：同一段话，不同分词策略会得到不同长度的 ID 序列，进而影响计算成本与语义粒度。
          </p>
          <p>
            若按<strong>词</strong>切分，词表会随语料膨胀，且大量未登录词（OOV）无法表示；若按<strong>字符</strong>切分，词表极小，但序列过长、难以捕获词级语义。现代大模型普遍采用<strong>子词（Subword）</strong>方案——在词级与字符级之间折中：常见词保持完整，生僻词拆成更小的片段，并用有限大小的词表覆盖海量文本。
          </p>
          <p>
            常见子词算法包括 BPE（GPT 系列）、WordPiece（BERT）、SentencePiece（T5 / LLaMA 等）。它们共享一个目标：在可控词表规模下，尽量保留语义单元、避免 UNK，并高效处理多语言与符号。下方 Demo 从最简单的空格切分出发，逐步过渡到 GPT 与 BERT 的真实词表，帮助你直观感受「同一句话，不同切法」的差异。
          </p>
        </div>
      </div>

      <div class="tokenizer-demo__intro-block tokenizer-demo__intro-block--algo">
        <header class="tokenizer-demo__algo-head">
          <h2 class="tokenizer-demo__section-label">{{ currentModule.meta.name }}</h2>
          <span class="tokenizer-demo__badge">{{ currentModule.meta.complexity }}</span>
        </header>
        <p class="tokenizer-demo__summary">{{ currentModule.meta.summary }}</p>
        <component :is="currentModule.Explanation" />
      </div>
    </section>

    <section class="tokenizer-demo__workbench" aria-label="分词交互区">
      <div class="tokenizer-demo__workbench-head">
        <h2 class="tokenizer-demo__section-label">试一试</h2>
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
      </div>

      <label class="tokenizer-demo__textarea-wrap">
        <span class="tokenizer-demo__label">输入文本</span>
        <textarea
          v-model="inputText"
          class="tokenizer-demo__textarea"
          rows="3"
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
            :class="{ 'tokenizer-demo__chip--partial': token.partialUtf8 }"
            :style="chipStyle(token.kind, index)"
            role="listitem"
            :title="token.partialUtf8 ? `bytes: ${bytesLabel(token.bytes)}` : token.text"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
          >
            <span class="tokenizer-demo__chip-text">{{ tokenDisplay(token) }}</span>
            <span v-if="token.id !== undefined" class="tokenizer-demo__chip-id">#{{ token.id }}</span>
          </button>
        </div>
      </div>

      <div class="tokenizer-demo__metrics">
        <dl class="tokenizer-demo__stat-row">
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
          <div v-if="extraStat">
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
      </div>

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
      </div>
    </section>
  </div>
</template>
