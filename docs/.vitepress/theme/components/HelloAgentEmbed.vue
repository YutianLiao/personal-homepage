<script setup lang="ts">
import { withBase } from "vitepress";

const src = withBase("/hello-agent/seq2seq-attention-tutorial-document.html");
</script>

<template>
  <div class="hello-agent-embed">
    <iframe
      class="hello-agent-embed__frame"
      :src="src"
      title="Seq2Seq 与注意力机制入门教程"
      loading="lazy"
    />
  </div>
</template>

<style scoped>
.hello-agent-embed {
  width: 100%;
  margin: 0 auto;
  background: #f5f4ed;
}

.hello-agent-embed__frame {
  display: block;
  width: 100%;
  min-height: calc(100vh - var(--vp-nav-height, 64px) - 2rem);
  border: none;
  background: #f5f4ed;
}
</style>
