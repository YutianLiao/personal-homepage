<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vitepress";
import type { BoardTheme, CompleteResult, DemoPhase, Difficulty } from "./types";
import { useSudokuAuth } from "./composables/useSudokuAuth";
import { useSudokuGame } from "./composables/useSudokuGame";
import { useSudokuPuzzles } from "./composables/useSudokuPuzzles";
import { formatTime, useSudokuRecords } from "./composables/useSudokuRecords";
import SudokuLogin from "./SudokuLogin.vue";
import SudokuLobby from "./SudokuLobby.vue";
import SudokuBoard from "./SudokuBoard.vue";
import SudokuHallOfFame from "./SudokuHallOfFame.vue";
import SudokuStats from "./SudokuStats.vue";
import SudokuHistory from "./SudokuHistory.vue";
import SudokuConfetti from "./SudokuConfetti.vue";
import SudokuSketchDecor from "./SudokuSketchDecor.vue";

type ArenaPanel = "hof" | "stats" | "history";

const { authenticated, logout, refresh: refreshAuth } = useSudokuAuth();
const game = useSudokuGame();
const puzzles = useSudokuPuzzles();
const recordsApi = useSudokuRecords();
const route = useRoute();

const {
  puzzle: activePuzzle,
  given,
  values,
  notes,
  selected,
  noteMode,
  elapsedMs,
  finished,
  failed,
  celebrating,
  isRepeat,
  submitWrong,
  submitEmpty,
  locked,
  conflicts,
  related,
  selectedDigit,
  canUndo,
  isPlaying,
  startedAt,
} = game;

const {
  totalCompleted,
  globalBestMs,
  averageMs,
  byDifficulty,
  completedIds,
  completionHistory,
  storageMode,
  linkedFileName,
  storageMessage,
  supportsFileSync,
  getRecord,
  recordCompletion,
  pickRandomCompletedId,
  refresh: refreshRecords,
  bindSyncFile,
  bindNewSyncFile,
  unbindSyncFile,
  exportData,
  importData,
} = recordsApi;

const phase = ref<DemoPhase>("login");
const theme = ref<BoardTheme>("light");
const busy = ref(false);
const statusMsg = ref("");
const completeResult = ref<CompleteResult | null>(null);
const showAbandonConfirm = ref(false);
const showFailModal = ref(false);
const showConfetti = ref(false);
const activePanel = ref<ArenaPanel | null>(null);

const panelTitles: Record<ArenaPanel, string> = {
  hof: "Hall of Fame",
  stats: "Your Stats",
  history: "历史记录",
};

function closePanel() {
  activePanel.value = null;
}

function openPanel(panel: ArenaPanel) {
  activePanel.value = panel;
}

const puzzleCount = computed(() => puzzles.index.value?.total ?? 0);

onMounted(async () => {
  refreshAuth();
  await refreshRecords();
  if (authenticated.value) phase.value = "lobby";
  try {
    await puzzles.ensureIndex();
  } catch {
    statusMsg.value = "题库索引加载失败，请运行 npm run prepare:sudoku";
  }
  window.addEventListener("beforeunload", onBeforeUnload);
});

watch(authenticated, (ok) => {
  if (!ok) {
    game.reset();
    phase.value = "login";
  } else if (phase.value === "login") {
    phase.value = "lobby";
  }
});

watch(
  () => route.path,
  () => {
    if (isPlaying.value) {
      game.reset();
      phase.value = "lobby";
      completeResult.value = null;
      showFailModal.value = false;
      showConfetti.value = false;
    }
  }
);

watch(celebrating, (on) => {
  showConfetti.value = on;
  if (on) {
    window.setTimeout(() => {
      showConfetti.value = false;
    }, 3200);
  }
});

function onBeforeUnload() {
  if (isPlaying.value) game.reset();
}

onUnmounted(() => {
  window.removeEventListener("beforeunload", onBeforeUnload);
  game.reset();
});

async function handleSubmit() {
  if (!activePuzzle.value || locked.value) return;
  const result = game.submit();
  if (result === "success") {
    const puzzle = activePuzzle.value;
    const timeMs = elapsedMs.value;
    const { isNewBest, previousBestMs } = await recordCompletion(
      puzzle,
      timeMs,
      startedAt.value
    );
    completeResult.value = { timeMs, isNewBest, previousBestMs, puzzle };
    phase.value = "completed";
    showConfetti.value = true;
    return;
  }
  showFailModal.value = true;
}

async function startNew(difficulty: Difficulty | "all") {
  busy.value = true;
  statusMsg.value = "";
  showFailModal.value = false;
  try {
    const { puzzle, repeat } = await puzzles.pickNewPuzzle(
      difficulty,
      completedIds.value
    );
    game.start(puzzle, repeat);
    completeResult.value = null;
    showConfetti.value = false;
    phase.value = "playing";
  } catch (e) {
    statusMsg.value = e instanceof Error ? e.message : "出题失败";
  } finally {
    busy.value = false;
  }
}

async function startHistory() {
  busy.value = true;
  statusMsg.value = "";
  showFailModal.value = false;
  try {
    const id = pickRandomCompletedId();
    if (!id) {
      statusMsg.value = "还没有已完成的题目";
      return;
    }
    const prev = getRecord(id);
    const puzzle = await puzzles.loadPuzzleById(id, prev?.difficulty);
    if (!puzzle) {
      statusMsg.value = "找不到该历史题目的题库数据";
      return;
    }
    game.start(puzzle, true);
    completeResult.value = null;
    showConfetti.value = false;
    phase.value = "playing";
  } catch (e) {
    statusMsg.value = e instanceof Error ? e.message : "历史挑战失败";
  } finally {
    busy.value = false;
  }
}

function requestAbandon() {
  showAbandonConfirm.value = true;
}

function confirmAbandon() {
  showAbandonConfirm.value = false;
  showFailModal.value = false;
  game.reset();
  completeResult.value = null;
  showConfetti.value = false;
  phase.value = "lobby";
}

function cancelAbandon() {
  showAbandonConfirm.value = false;
}

function backToLobby() {
  showFailModal.value = false;
  game.reset();
  completeResult.value = null;
  showConfetti.value = false;
  phase.value = "lobby";
}

function retryAfterFail() {
  showFailModal.value = false;
  game.retrySamePuzzle();
}

async function playAgain() {
  await startNew("all");
}

function onLogout() {
  game.reset();
  logout();
}

async function onBindFile() {
  await bindSyncFile();
}

async function onBindNew() {
  await bindNewSyncFile();
}

async function onUnbind() {
  await unbindSyncFile();
}

function onExportData() {
  exportData();
}

async function onImportData(file: File, mode: "replace" | "merge") {
  await importData(file, mode);
}
</script>

<template>
  <div class="sudoku-demo-scene" :class="{ 'sudoku-demo-scene--login': !authenticated }">
    <SudokuSketchDecor v-if="authenticated" />

    <div class="sudoku-demo-scene__main">
      <div v-if="!authenticated" class="sudoku-demo sudoku-demo--login">
        <SudokuLogin @success="phase = 'lobby'" />
      </div>

      <div
        v-else
        class="sudoku-demo sudoku-demo--arena"
        :class="{
          'sudoku-demo--lobby': phase === 'lobby',
          'sudoku-demo--playing': phase === 'playing',
        }"
      >
    <SudokuConfetti :active="showConfetti" />

    <header class="sudoku-arena__hud">
      <div class="sudoku-arena__brand">
        <h2 class="sudoku-arena__title site-page-title">Sudoku Lab</h2>
        <span v-if="phase === 'playing'" class="sudoku-arena__timer">{{ formatTime(elapsedMs) }}</span>
        <span
          v-else-if="phase === 'completed' && completeResult"
          class="sudoku-arena__timer sudoku-arena__timer--done"
        >
          {{ formatTime(completeResult.timeMs) }}
        </span>
        <span v-else class="sudoku-arena__timer sudoku-arena__timer--placeholder" aria-hidden="true">00:00.00</span>
      </div>
      <nav class="sudoku-arena__nav" aria-label="数独导航">
        <button type="button" class="sudoku-arena__nav-btn" @click="openPanel('hof')">名人堂</button>
        <button type="button" class="sudoku-arena__nav-btn" @click="openPanel('stats')">统计</button>
        <button type="button" class="sudoku-arena__nav-btn" @click="openPanel('history')">历史记录</button>
        <button type="button" class="sudoku-arena__nav-btn sudoku-arena__nav-btn--ghost" @click="onLogout">登出</button>
      </nav>
    </header>

    <div class="sudoku-arena__body">
      <p v-if="statusMsg" class="sudoku-demo__status" role="status">{{ statusMsg }}</p>

      <div class="sudoku-arena__stage">
        <SudokuBoard
          v-if="(phase === 'playing' || phase === 'completed') && activePuzzle"
          :puzzle="activePuzzle"
          :values="values"
          :given="given"
          :notes="notes"
          :selected="selected"
          :conflicts="conflicts"
          :related="related"
          :selected-digit="selectedDigit"
          :note-mode="noteMode"
          :can-undo="canUndo"
          :elapsed-ms="elapsedMs"
          :finished="finished"
          :failed="failed"
          :locked="locked"
          :celebrating="celebrating"
          :is-repeat="isRepeat"
          :theme="theme"
          :submit-wrong="submitWrong"
          :submit-empty="submitEmpty"
          @update:theme="theme = $event"
          @select="game.selectCell"
          @digit="game.applyDigit"
          @erase="game.erase"
          @undo="game.undoMove"
          @toggle-notes="game.toggleNoteMode"
          @move="(dr, dc) => game.moveSelection(dr, dc)"
          @abandon="requestAbandon"
          @submit="handleSubmit"
        />

        <section
          v-else-if="phase === 'lobby'"
          class="sudoku-board sudoku-demo__panel sudoku-board--light sudoku-arena__idle-board"
          aria-label="等待开始"
        >
          <header class="sudoku-board__head sudoku-arena__idle-head">
            <span class="sudoku-board__source sudoku-arena__idle-label">Ready</span>
            <span class="sudoku-board__id">选择难度后开始</span>
          </header>

          <div class="sudoku-board__grid-wrap">
            <div class="sudoku-demo__idle-grid" aria-hidden="true">
              <span v-for="n in 81" :key="n" :style="{ '--idle-i': String(n - 1) }" />
            </div>
          </div>
        </section>
      </div>

      <div
        v-if="phase === 'completed' && completeResult"
        class="sudoku-arena__result"
        aria-live="polite"
      >
        <p class="sudoku-arena__result-label">
          <template v-if="completeResult.isNewBest">新纪录</template>
          <template v-else>完成</template>
        </p>
        <p class="sudoku-demo__complete-time">{{ formatTime(completeResult.timeMs) }}</p>
        <p class="site-prose sudoku-arena__result-copy">
          <template v-if="completeResult.isNewBest && completeResult.previousBestMs != null">
            上次最佳 {{ formatTime(completeResult.previousBestMs) }}
          </template>
          <template v-else-if="!completeResult.isNewBest">
            最佳仍为 {{ formatTime(completeResult.previousBestMs!) }}
          </template>
        </p>
        <p class="sudoku-demo__muted">
          {{ completeResult.puzzle.sourceLabel }} · {{ completeResult.puzzle.difficulty }}
        </p>
        <div class="sudoku-demo__complete-actions">
          <button type="button" class="sudoku-lobby__btn sudoku-lobby__btn--primary" @click="playAgain">
            再来一题
          </button>
          <button type="button" class="sudoku-lobby__btn" @click="backToLobby">返回大厅</button>
        </div>
      </div>
    </div>

    <footer v-if="phase === 'lobby'" class="sudoku-arena__dock">
      <SudokuLobby
        :completed-count="totalCompleted"
        :puzzle-count="puzzleCount"
        :loading="busy || puzzles.loading.value"
        @new-challenge="startNew"
        @history-challenge="startHistory"
      />
    </footer>

    <div
      v-if="activePanel"
      class="sudoku-arena__overlay"
      @click.self="closePanel"
    >
      <div
        class="sudoku-arena__sheet sudoku-arena__sheet--panel"
        :class="{ 'sudoku-arena__sheet--compact': activePanel === 'stats' }"
        role="dialog"
        aria-modal="true"
        :aria-label="panelTitles[activePanel]"
      >
        <header class="sudoku-arena__sheet-head">
          <h3 class="sudoku-arena__sheet-title">{{ panelTitles[activePanel] }}</h3>
          <button type="button" class="sudoku-arena__sheet-close" aria-label="关闭" @click="closePanel">
            ×
          </button>
        </header>
        <div class="sudoku-arena__sheet-body">
          <SudokuHallOfFame v-if="activePanel === 'hof'" :global-best-ms="globalBestMs" />
          <SudokuStats
            v-else-if="activePanel === 'stats'"
            :total-completed="totalCompleted"
            :global-best-ms="globalBestMs"
            :average-ms="averageMs"
            :by-difficulty="byDifficulty"
          />
          <SudokuHistory
            v-else-if="activePanel === 'history'"
            :entries="completionHistory"
            :storage-mode="storageMode"
            :linked-file-name="linkedFileName"
            :storage-message="storageMessage"
            :supports-file-sync="supportsFileSync"
            @bind-file="onBindFile"
            @bind-new="onBindNew"
            @unbind="onUnbind"
            @export-data="onExportData"
            @import-data="onImportData"
          />
        </div>
      </div>
    </div>

    <div
      v-if="showAbandonConfirm"
      class="sudoku-demo__modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sudoku-abandon-title"
    >
      <div class="sudoku-demo__modal-card">
        <h3 id="sudoku-abandon-title">本局将作废</h3>
        <p class="site-prose">返回大厅后，本次对局不会写入任何记录，相当于未开始。</p>
        <div class="sudoku-demo__complete-actions">
          <button type="button" class="sudoku-lobby__btn sudoku-lobby__btn--primary" @click="confirmAbandon">
            确认放弃
          </button>
          <button type="button" class="sudoku-lobby__btn" @click="cancelAbandon">继续做题</button>
        </div>
      </div>
    </div>

    <div
      v-if="showFailModal"
      class="sudoku-demo__modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sudoku-fail-title"
    >
      <div class="sudoku-demo__modal-card sudoku-demo__modal-card--fail">
        <h3 id="sudoku-fail-title">提交未通过</h3>
        <div class="sudoku-demo__complete-actions">
          <button type="button" class="sudoku-lobby__btn sudoku-lobby__btn--primary" @click="retryAfterFail">
            重新尝试
          </button>
          <button type="button" class="sudoku-lobby__btn" @click="backToLobby">返回大厅</button>
        </div>
      </div>
    </div>
      </div>
    </div>
  </div>
</template>
