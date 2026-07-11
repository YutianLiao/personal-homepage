<script setup lang="ts">
import { computed } from "vue";
import hall from "../../../data/sudoku/hall-of-fame.json";
import { formatTimeShort } from "./composables/useSudokuRecords";

const props = defineProps<{
  globalBestMs: number | null;
}>();

const benchmark = computed(
  () => hall.speedRecords.find((r) => r.id === hall.benchmarkId) ?? hall.speedRecords[0]
);

const gap = computed(() => {
  if (props.globalBestMs == null || !benchmark.value) return null;
  const delta = props.globalBestMs - benchmark.value.timeMs;
  return {
    delta,
    ratio: Math.min(1, benchmark.value.timeMs / props.globalBestMs),
  };
});

function formatGap(ms: number) {
  if (ms <= 0) return "已追平或超越该纪录（注意：难度与赛题不同，仅供趣味对照）";
  return `还差 ${formatTimeShort(ms)}（注意：难度与赛题不同，仅供趣味对照）`;
}
</script>

<template>
  <section class="sudoku-hof sudoku-demo__panel" aria-label="名人堂">
    <h3 class="sudoku-demo__panel-title sudoku-hof__title">
      <span class="sudoku-hof__trophy" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M7 4h10v3c0 2.2-1.5 4.1-3.6 4.6L12 22l-1.4-10.4C8.5 11.1 7 9.2 7 7V4Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <path
            d="M5 4H3v1.5c0 1.7 1.2 3.1 2.8 3.4M19 4h2v1.5c0 1.7-1.2 3.1-2.8 3.4"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path d="M9 7h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </span>
      Hall of Fame
    </h3>

    <div class="sudoku-hof__gap" aria-live="polite">
      <p class="sudoku-demo__label">与世锦赛纪录的差距</p>
      <template v-if="gap && benchmark">
        <p class="sudoku-hof__gap-text site-prose">
          你的最快 <strong>{{ formatTimeShort(globalBestMs!) }}</strong>，
          距 {{ benchmark.person }}（{{ benchmark.label }} ·
          {{ formatTimeShort(benchmark.timeMs) }}）{{ formatGap(gap.delta) }}。
        </p>
        <div class="sudoku-hof__bar" role="img" :aria-label="`相对进度 ${Math.round(gap.ratio * 100)}%`">
          <span class="sudoku-hof__bar-fill" :style="{ width: `${gap.ratio * 100}%` }" />
        </div>
      </template>
      <p v-else class="sudoku-hof__gap-text site-prose">
        完成第一题后，这里会对比你与王诗瑶 2018 世锦赛纪录（54.44s）的差距。
      </p>
    </div>

    <h4 class="sudoku-hof__sub">官方历史最佳</h4>
    <ul class="sudoku-hof__records">
      <li v-for="r in hall.speedRecords" :key="r.id">
        <span class="sudoku-hof__records-time">{{ formatTimeShort(r.timeMs) }}</span>
        <span class="sudoku-hof__records-body">
          <strong>{{ r.person }}</strong> · {{ r.label }}
          <em>{{ r.year }} · {{ r.location }}</em>
        </span>
      </li>
    </ul>

    <h4 class="sudoku-hof__sub">WSC 历届冠军</h4>
    <div class="sudoku-hof__table-wrap">
      <table class="sudoku-hof__table">
        <thead>
          <tr>
            <th>年</th>
            <th>冠军</th>
            <th>地点</th>
            <th>国籍</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in hall.champions" :key="c.year">
            <td>{{ c.year }}</td>
            <td>{{ c.champion }}</td>
            <td>{{ c.location }}</td>
            <td>{{ c.country }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
