<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";

const props = defineProps<{
  active: boolean;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let raf = 0;
let particles: Array<{
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  decay: number;
}> = [];

const colors = ["#9f1239", "#1e3a5f", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"];

function spawn(width: number, height: number) {
  const cx = width * 0.5;
  const cy = height * 0.35;
  for (let i = 0; i < 120; i++) {
    const angle = (Math.PI * 2 * i) / 120 + Math.random() * 0.4;
    const speed = 2 + Math.random() * 5;
    particles.push({
      x: cx + (Math.random() - 0.5) * 40,
      y: cy + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 4 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
      decay: 0.008 + Math.random() * 0.012,
    });
  }
}

function tick() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  particles = particles.filter((p) => p.life > 0);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.12;
    p.life -= p.decay;
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (particles.length > 0) {
    raf = requestAnimationFrame(tick);
  }
}

function start() {
  cancelAnimationFrame(raf);
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * devicePixelRatio;
  canvas.height = rect.height * devicePixelRatio;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.scale(devicePixelRatio, devicePixelRatio);
  particles = [];
  spawn(rect.width, rect.height);
  tick();
}

function stop() {
  cancelAnimationFrame(raf);
  particles = [];
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

watch(
  () => props.active,
  (on) => {
    if (on) start();
    else stop();
  }
);

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
});
</script>

<template>
  <canvas
    v-show="active"
    ref="canvasRef"
    class="sudoku-confetti"
    aria-hidden="true"
  />
</template>
