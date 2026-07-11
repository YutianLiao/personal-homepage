<script setup lang="ts">
import { computed } from "vue";
import type { Difficulty } from "./types";
import { formatTimeShort } from "./composables/useSudokuRecords";

const props = defineProps<{
  totalCompleted: number;
  globalBestMs: number | null;
  averageMs: number | null;
  byDifficulty: Record<Difficulty, number>;
}>();

const rows = computed(() =>
  (["easy", "medium", "hard", "expert"] as Difficulty[]).map((d) => ({
    key: d,
    label: d.charAt(0).toUpperCase() + d.slice(1),
    count: props.byDifficulty[d] ?? 0,
  }))
);

const maxDiffCount = computed(() =>
  Math.max(1, ...rows.value.map((r) => r.count))
);

function barWidth(count: number) {
  return `${Math.round((count / maxDiffCount.value) * 100)}%`;
}
</script>

<template>
  <section class="sudoku-stats" aria-label="个人统计">
    <p v-if="totalCompleted === 0" class="sudoku-stats__empty site-prose">
      完成第一局后，这里会汇总你的完成数、最快用时与各难度分布。
    </p>

    <div class="sudoku-stats__metrics">
      <article class="sudoku-stats__metric sudoku-stats__metric--primary">
        <span class="sudoku-stats__metric-label">完成</span>
        <span class="sudoku-stats__metric-value">{{ totalCompleted }}</span>
        <span class="sudoku-stats__metric-unit">题</span>
      </article>
      <article class="sudoku-stats__metric">
        <span class="sudoku-stats__metric-label">最快</span>
        <span class="sudoku-stats__metric-value">
          {{ globalBestMs != null ? formatTimeShort(globalBestMs) : "—" }}
        </span>
      </article>
      <article class="sudoku-stats__metric">
        <span class="sudoku-stats__metric-label">平均最佳</span>
        <span class="sudoku-stats__metric-value">
          {{ averageMs != null ? formatTimeShort(averageMs) : "—" }}
        </span>
      </article>
    </div>

    <div class="sudoku-stats__breakdown">
      <h4 class="sudoku-stats__section-title">难度分布</h4>
      <ul class="sudoku-stats__bars">
        <li
          v-for="row in rows"
          :key="row.key"
          class="sudoku-stats__bar-row"
          :class="`sudoku-stats__bar-row--${row.key}`"
        >
          <div class="sudoku-stats__bar-head">
            <span class="sudoku-stats__bar-label">{{ row.label }}</span>
            <span class="sudoku-stats__bar-count">{{ row.count }}</span>
          </div>
          <div
            class="sudoku-stats__bar-track"
            role="img"
            :aria-label="`${row.label} ${row.count} 题`"
          >
            <span class="sudoku-stats__bar-fill" :style="{ width: barWidth(row.count) }" />
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
