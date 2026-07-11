<script setup lang="ts">
/** 9×9 格线：cell=10，viewBox 90×90 */
const CELL = 10;

/** 合法局部盘面；(0,2) 为行内裸单 — 仅缺 4 */
const GIVENS: [number, number, number][] = [
  [0, 0, 5],
  [0, 1, 3],
  [0, 3, 6],
  [0, 4, 7],
  [0, 5, 8],
  [0, 6, 9],
  [0, 7, 1],
  [0, 8, 2],
  [1, 0, 6],
  [2, 1, 9],
  [2, 2, 8],
  [3, 4, 6],
  [4, 3, 8],
  [4, 4, 5],
  [4, 5, 3],
  [6, 1, 6],
  [7, 3, 4],
  [7, 4, 1],
  [8, 4, 8],
];

const DEDUCE = { row: 0, col: 2, value: 4 };

function cellX(col: number) {
  return col * CELL + 5;
}

function cellY(row: number) {
  return row * CELL + 8;
}

/** 与 SudokuGrid 一致：1–9 占 3×3 笔记格 */
function noteX(digit: number, originX: number) {
  return originX - 5 + ((digit - 1) % 3) * 5;
}

function noteY(digit: number, originY: number) {
  return originY - 7 + Math.floor((digit - 1) / 3) * 5;
}

const NOTE_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const NOTE_ORIGIN = { x: 28, y: 28 };
</script>

<template>
  <div class="sudoku-sketch-decor" aria-hidden="true">
    <div class="sudoku-sketch-decor__side sudoku-sketch-decor__side--left">
      <figure class="sudoku-sketch-decor__piece sudoku-sketch-decor__piece--grid">
        <svg viewBox="0 0 90 108" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="0.5"
            y="0.5"
            width="89"
            height="89"
            rx="1.5"
            stroke="currentColor"
            stroke-width="1"
            stroke-opacity="0.42"
          />
          <path
            d="M0 30h90M0 60h90M30 0v90M60 0v90"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-opacity="0.5"
          />
          <path
            d="M0 10h90M0 20h90M0 40h90M0 50h90M0 70h90M0 80h90M10 0v90M20 0v90M40 0v90M50 0v90M70 0v90M80 0v90"
            stroke="currentColor"
            stroke-width="0.55"
            stroke-opacity="0.28"
          />

          <text
            v-for="([row, col, value], idx) in GIVENS"
            :key="`g-${idx}`"
            :x="cellX(col)"
            :y="cellY(row)"
            text-anchor="middle"
            fill="currentColor"
            fill-opacity="0.5"
            font-size="8"
            font-family="Georgia, serif"
          >
            {{ value }}
          </text>

          <circle
            :cx="cellX(DEDUCE.col)"
            :cy="cellY(DEDUCE.row) - 3"
            r="4.4"
            stroke="currentColor"
            stroke-width="0.75"
            stroke-opacity="0.42"
            stroke-dasharray="2 2"
          />
          <text
            :x="cellX(DEDUCE.col)"
            :y="cellY(DEDUCE.row)"
            text-anchor="middle"
            fill="currentColor"
            fill-opacity="0.62"
            font-size="8"
            font-family="Georgia, serif"
            font-style="italic"
          >
            {{ DEDUCE.value }}
          </text>

          <text
            x="45"
            y="102"
            text-anchor="middle"
            fill="currentColor"
            fill-opacity="0.38"
            font-size="6.5"
            font-family="var(--site-sans, sans-serif)"
          >
            第一行已填 8 数 → 此格只能是 4
          </text>
        </svg>
      </figure>
    </div>

    <div class="sudoku-sketch-decor__side sudoku-sketch-decor__side--right">
      <figure class="sudoku-sketch-decor__piece sudoku-sketch-decor__piece--note-keypad">
        <svg viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="2"
            y="4"
            width="42"
            height="20"
            rx="4"
            fill="currentColor"
            fill-opacity="0.1"
            stroke="currentColor"
            stroke-width="0.9"
            stroke-opacity="0.42"
          />
          <text
            x="23"
            y="17.5"
            text-anchor="middle"
            fill="currentColor"
            fill-opacity="0.55"
            font-size="7"
            font-family="var(--site-sans, sans-serif)"
            font-weight="600"
          >
            笔记
          </text>
          <text
            x="58"
            y="17"
            fill="currentColor"
            fill-opacity="0.34"
            font-size="6.5"
            font-family="var(--site-sans, sans-serif)"
          >
            快捷键 N
          </text>
        </svg>
      </figure>

      <figure class="sudoku-sketch-decor__piece sudoku-sketch-decor__piece--note-cell">
        <svg viewBox="0 0 56 68" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="8"
            y="4"
            width="40"
            height="40"
            rx="2"
            stroke="currentColor"
            stroke-width="0.9"
            stroke-opacity="0.32"
          />
          <text
            v-for="d in NOTE_DIGITS"
            :key="`n-${d}`"
            :x="noteX(d, NOTE_ORIGIN.x)"
            :y="noteY(d, NOTE_ORIGIN.y)"
            fill="currentColor"
            :fill-opacity="d === 6 ? 0.5 : 0.28"
            font-size="6"
            font-family="Georgia, serif"
          >
            {{ d }}
          </text>
          <text
            x="28"
            y="54"
            text-anchor="middle"
            fill="currentColor"
            fill-opacity="0.36"
            font-size="5.5"
            font-family="var(--site-sans, sans-serif)"
          >
            再按 6 切换候选
          </text>
        </svg>
      </figure>

      <figure class="sudoku-sketch-decor__piece sudoku-sketch-decor__piece--note-steps">
        <svg viewBox="0 0 88 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="10" fill="currentColor" fill-opacity="0.34" font-size="6" font-family="var(--site-sans, sans-serif)">1. 开启笔记模式</text>
          <text x="0" y="22" fill="currentColor" fill-opacity="0.34" font-size="6" font-family="var(--site-sans, sans-serif)">2. 点选要标记的空格</text>
          <text x="0" y="34" fill="currentColor" fill-opacity="0.34" font-size="6" font-family="var(--site-sans, sans-serif)">3. 按 1–9 记/消候选</text>
          <text x="0" y="48" fill="currentColor" fill-opacity="0.28" font-size="5.5" font-family="var(--site-sans, sans-serif)">关闭笔记后按数字填格</text>
        </svg>
      </figure>
    </div>
  </div>
</template>
