<script setup lang="ts">
import { ref } from "vue";
import { useSudokuAuth } from "./composables/useSudokuAuth";

const emit = defineEmits<{ success: [] }>();
const { login } = useSudokuAuth();

const password = ref("");
const error = ref(false);
const shaking = ref(false);
const busy = ref(false);

async function submit() {
  if (busy.value) return;
  busy.value = true;
  error.value = false;
  const ok = await login(password.value);
  busy.value = false;
  if (ok) {
    emit("success");
    return;
  }
  error.value = true;
  shaking.value = true;
  window.setTimeout(() => {
    shaking.value = false;
  }, 420);
}
</script>

<template>
  <div class="sudoku-login">
    <section
      class="sudoku-login__panel"
      :class="{ 'sudoku-login__panel--shake': shaking }"
      aria-labelledby="sudoku-login-title"
    >
      <p class="sudoku-login__eyebrow">Sudoku Lab</p>
      <h2 id="sudoku-login-title" class="sudoku-login__title">Enter the grid</h2>
      <p class="sudoku-login__hint site-prose">
        此 Demo 需要密码才能进入。对局开始后不可暂停；中途离开本局作废。
      </p>
      <form class="sudoku-login__form" @submit.prevent="submit">
        <label class="sudoku-login__field">
          <span>Password</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••••••"
            :aria-invalid="error"
            aria-describedby="sudoku-login-error"
          />
        </label>
        <p
          v-if="error"
          id="sudoku-login-error"
          class="sudoku-login__error"
          role="alert"
        >
          密码不正确，请重试。
        </p>
        <button type="submit" class="sudoku-login__btn" :disabled="busy">
          {{ busy ? "…" : "Unlock" }}
        </button>
      </form>
    </section>
  </div>
</template>
