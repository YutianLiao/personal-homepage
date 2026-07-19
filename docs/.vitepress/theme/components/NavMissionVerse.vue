<script setup lang="ts">
import { withBase } from "vitepress";
</script>

<template>
  <span
    class="nav-mission-verse"
    aria-label="为天地立心, 为生民立命, 为往圣继绝学, 为万世开太平"
  >
    <img
      class="nav-mission-verse__scholar"
      :src="withBase('/decorative/navigation/scholar-back.png')"
      alt=""
      aria-hidden="true"
      draggable="false"
    />
    <span class="nav-mission-verse__quote" aria-hidden="true">
      <span class="nav-mission-verse__line">
        <span>为天地立心</span>
        <span>为生民立命</span>
      </span>
      <span class="nav-mission-verse__line">
        <span>为往圣继绝学</span>
        <span>为万世开太平</span>
      </span>
    </span>
  </span>
</template>
