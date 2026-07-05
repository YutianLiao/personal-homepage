<script setup lang="ts">
defineEmits<{
  add: [];
}>();
</script>

<template>
  <div class="nebula-hud">
    <div class="nebula-hud__brand">
      <span class="nebula-hud__eyebrow">Interest Journey</span>
      <h1 class="nebula-hud__title">Knowledge Map</h1>
    </div>
    <button type="button" class="km-btn km-btn--primary nebula-hud__add" @click="$emit('add')">
      + 添加知识点
    </button>
  </div>
</template>
