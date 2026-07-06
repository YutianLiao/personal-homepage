<template>
  <div class="tokenizer-demo">
    <aside class="tokenizer-demo__docs">
      <section class="tokenizer-demo__panel">
        <h3 class="tokenizer-demo__panel-title">什么是分词器</h3>
        <div class="tokenizer-demo__panel-body site-prose">
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
      </section>

      <section v-if="currentModule" class="tokenizer-demo__panel">
        <header class="tokenizer-demo__algo-head">
          <h3 class="tokenizer-demo__panel-title">{{ currentModule.meta.name }}</h3>
          <span class="tokenizer-demo__badge" v-html="currentModule.meta.complexity" />
        </header>
        <div class="tokenizer-demo__panel-body site-prose">
          <component :is="currentModule.Explanation" />
        </div>
      </section>
    </aside>

    <div class="tokenizer-demo__stage">
      <section class="tokenizer-demo__panel tokenizer-demo__viz-panel" aria-label="分词可视化">
        <div class="tokenizer-demo__panel-head">
          <h3 class="tokenizer-demo__panel-title">算法可视化</h3>
          <span v-if="loading" class="tokenizer-demo__status">加载词表中…</span>
        </div>

        <div class="tokenizer-demo__toolbar">
          <label class="tokenizer-demo__field">
            <span>算法</span>
            <select v-model="algorithmId">
              <option v-for="mod in TOKENIZER_META" :key="mod.id" :value="mod.id">
                {{ mod.name }}
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

        <label class="tokenizer-demo__input-box">
          <span class="tokenizer-demo__label">输入文本</span>
          <textarea
            v-model="inputText"
            class="tokenizer-demo__textarea"
            rows="4"
            placeholder="输入任意文本..."
            spellcheck="false"
          />
        </label>

        <div class="tokenizer-demo__chips-box">
          <span class="tokenizer-demo__label">Token 输出</span>
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
              :title="token.partialUtf8 ? `bytes: ${bytesLabel(token.bytes)}` : token.text || bytesLabel(token.bytes)"
              @mouseenter="hoveredIndex = index"
              @mouseleave="hoveredIndex = null"
            >
              <span class="tokenizer-demo__chip-text">{{ tokenDisplay(token) }}</span>
              <span v-if="token.id !== undefined" class="tokenizer-demo__chip-id">#{{ token.id }}</span>
            </button>
          </div>
          <p v-if="stats.partialUtf8 > 0" class="tokenizer-demo__hint">
            十六进制片段为不完整 UTF-8 字节，相邻 token 拼接后还原为可读字符。
          </p>
        </div>
      </section>

      <section class="tokenizer-demo__panel tokenizer-demo__stats-panel" aria-label="统计与详情">
        <h3 class="tokenizer-demo__panel-title">统计与详情</h3>
        <div class="tokenizer-demo__panel-body">
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
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import type { BpeEncodingId, Token, TokenKind, TokenizerModule } from "./tokenizer/types";
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

const inputText = ref(SAMPLE_TEXTS[0]);
const algorithmId = ref("whitespace");
const bpeEncodingId = ref<BpeEncodingId>("cl100k_base");
const tokens = ref<Token[]>([]);
const loading = ref(false);
const error = ref("");
const hoveredIndex = ref<number | null>(null);
const ready = ref(false);
const currentModule = ref<TokenizerModule | null>(null);

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

async function ensureBpeEncoding(id: BpeEncodingId) {
  const { setBpeEncoding } = await import("./tokenizer/bpe");
  await setBpeEncoding(id);
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

watch(algorithmId, async () => {
  loading.value = true;
  try {
    await ensureModule();
    if (!ready.value) return;
    if (algorithmId.value === "bpe") {
      await ensureBpeEncoding(bpeEncodingId.value);
    }
    await runTokenize();
  } finally {
    loading.value = false;
  }
});

watch([inputText, bpeEncodingId], async () => {
  if (!ready.value) return;
  if (algorithmId.value === "bpe") {
    await ensureBpeEncoding(bpeEncodingId.value);
  }
  await runTokenize();
});
</script>
