<script setup lang="ts">
const query = defineModel<string>({ default: "" });
</script>

<template>
  <div class="km-search site-panel">
    <label class="km-search__label" for="km-search">
      <span class="km-search__icon" aria-hidden="true" />
      搜索星图
    </label>
    <input
      id="km-search"
      v-model="query"
      type="search"
      class="km-search__input"
      placeholder="知识点名称、主题…"
      autocomplete="off"
      spellcheck="false"
    />
  </div>
</template>

<style scoped>
.km-search {
  flex-shrink: 0;
  padding: var(--space-2) var(--space-3);
  background: var(--km-surface);
  border-color: var(--km-border);
  backdrop-filter: var(--km-glass-blur);
  -webkit-backdrop-filter: var(--km-glass-blur);
}

.km-search__label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.45rem;
  font-family: var(--site-sans);
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--site-text-secondary);
  letter-spacing: 0.03em;
}

.km-search__icon {
  width: 13px;
  height: 13px;
  border: 1.5px solid var(--site-secondary);
  border-radius: 50%;
  position: relative;
  opacity: 0.75;
}

.km-search__icon::after {
  content: "";
  position: absolute;
  width: 5px;
  height: 1.5px;
  background: var(--site-secondary);
  bottom: -1px;
  right: -3px;
  transform: rotate(45deg);
}

.km-search__input {
  width: 100%;
  padding: 0.55rem 0.7rem;
  font-family: var(--site-sans);
  font-size: var(--fs-sm);
  border: 1px solid var(--km-border);
  border-radius: 6px;
  background: var(--km-surface-2);
  color: var(--site-text);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.km-search__input::placeholder {
  color: var(--site-text-muted);
}

.km-search__input:focus {
  outline: none;
  border-color: var(--site-secondary);
  box-shadow: 0 0 0 3px var(--site-secondary-soft);
}
</style>
