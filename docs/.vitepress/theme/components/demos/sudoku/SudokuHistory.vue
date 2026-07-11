<script setup lang="ts">
import { ref } from "vue";
import type { CompletionHistoryEntry } from "./types";
import type { SudokuStorageMode } from "./composables/sudoku-storage";
import { formatDurationHuman, formatStartTime } from "./composables/useSudokuRecords";

const props = defineProps<{
  entries: CompletionHistoryEntry[];
  storageMode: SudokuStorageMode;
  linkedFileName: string | null;
  storageMessage: string;
  supportsFileSync: boolean;
}>();

const emit = defineEmits<{
  bindFile: [];
  bindNew: [];
  unbind: [];
  exportData: [];
  importData: [file: File, mode: "replace" | "merge"];
}>();

const importInput = ref<HTMLInputElement | null>(null);
const importMode = ref<"replace" | "merge">("merge");

function diffLabel(d: string) {
  return d.charAt(0).toUpperCase() + d.slice(1);
}

function openImport(mode: "replace" | "merge") {
  importMode.value = mode;
  importInput.value?.click();
}

function onImportChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) emit("importData", file, importMode.value);
  input.value = "";
}
</script>

<template>
  <section class="sudoku-history" aria-label="历史记录">
    <div class="sudoku-history__storage">
      <h4 class="sudoku-history__storage-title">数据存储</h4>
      <p class="sudoku-history__storage-copy site-prose">
        默认保存在本浏览器。可绑定本地 JSON 文件（放在 iCloud / Dropbox 等同步文件夹内即可跨设备自动覆盖同步）。
      </p>
      <p class="sudoku-history__storage-status">
        <span class="sudoku-demo__label">当前模式</span>
        {{ storageMode === "file" ? `文件同步${linkedFileName ? ` · ${linkedFileName}` : ""}` : "仅本地浏览器" }}
      </p>
      <p v-if="storageMessage" class="sudoku-history__storage-msg" role="status">{{ storageMessage }}</p>
      <div class="sudoku-history__storage-actions">
        <template v-if="supportsFileSync">
          <button type="button" class="sudoku-lobby__btn" @click="emit('bindFile')">绑定已有文件</button>
          <button type="button" class="sudoku-lobby__btn" @click="emit('bindNew')">新建同步文件</button>
          <button
            v-if="storageMode === 'file'"
            type="button"
            class="sudoku-lobby__btn"
            @click="emit('unbind')"
          >
            解除绑定
          </button>
        </template>
        <button type="button" class="sudoku-lobby__btn" @click="emit('exportData')">导出备份</button>
        <button type="button" class="sudoku-lobby__btn" @click="openImport('merge')">合并导入</button>
        <button type="button" class="sudoku-lobby__btn" @click="openImport('replace')">覆盖导入</button>
      </div>
      <input
        ref="importInput"
        type="file"
        accept="application/json,.json"
        class="sudoku-history__file-input"
        tabindex="-1"
        aria-hidden="true"
        @change="onImportChange"
      />
    </div>

    <h4 class="sudoku-history__list-title">完成记录</h4>
    <p v-if="entries.length === 0" class="sudoku-history__empty site-prose">
      成功提交第一局后，这里会记录每次挑战的开始时间、用时与难度。
    </p>
    <div v-else class="sudoku-history__table-wrap">
      <table class="sudoku-history__table">
        <thead>
          <tr>
            <th>开始时间</th>
            <th>用时</th>
            <th>难度</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in entries" :key="row.id">
            <td>{{ formatStartTime(row.startedAt) }}</td>
            <td>{{ formatDurationHuman(row.durationMs) }}</td>
            <td>{{ diffLabel(row.difficulty) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
