<script setup lang="ts">
import { computed } from "vue";
import { useData, withBase } from "vitepress";
import DefaultLayout from "vitepress/dist/client/theme-default/Layout.vue";
import HomeMathPiece from "./components/HomeMathPiece.vue";
import HomeVPHomeFeatures from "./components/HomeVPHomeFeatures.vue";
import DocAsideScientistSketch from "./components/DocAsideScientistSketch.vue";
import GalleryAsideOutline from "./components/GalleryAsideOutline.vue";
import ModuleTopNav from "./components/ModuleTopNav.vue";
import NavMissionVerse from "./components/NavMissionVerse.vue";

const { frontmatter } = useData();

const isHome = computed(() => frontmatter.value.layout === "home");

const heroText = computed(() => {
  const h = frontmatter.value.hero as { text?: string } | undefined;
  return h?.text;
});

const heroTagline = computed(() => {
  const h = frontmatter.value.hero as { tagline?: string } | undefined;
  return h?.tagline;
});

function hideBroken(e: Event) {
  const el = e.target as HTMLImageElement;
  el.style.display = "none";
}
</script>

<template>
  <DefaultLayout>
    <template #nav-bar-content-after>
      <NavMissionVerse />
    </template>

    <template v-if="isHome" #home-hero-info>
      <div class="hero-math-decor" aria-hidden="true">
        <HomeMathPiece name="sudoku" />
      </div>
      <div class="vp-hero-copy">
        <h1 class="heading vp-hero-with-mascot">
          <span v-if="heroText" class="text vp-hero-math-line" v-html="heroText"></span>
        </h1>
        <img
          class="vp-hero-flora vp-hero-rainbow"
          :src="withBase('/decorative/hero-sketch/rainbow.png')"
          alt=""
          aria-hidden="true"
          draggable="false"
          @error="hideBroken"
        />
        <p v-if="heroTagline" class="tagline vp-hero-tagline-comment">
          <span class="vp-hero-comment-pipe" aria-hidden="true">|</span>
          <span v-html="heroTagline"></span>
        </p>
        <p class="vp-hero-math-euler" aria-hidden="true">
          <span class="vp-hero-math-formula">e<sup>i&pi;</sup> + 1 = 0</span>
        </p>
      </div>
    </template>

    <template v-if="isHome" #home-features-before>
      <div class="home-features-custom">
        <div class="home-math-rail-continued" aria-hidden="true">
          <HomeMathPiece name="geometry" />
        </div>
        <HomeVPHomeFeatures />
      </div>
    </template>

    <template #doc-before>
      <ModuleTopNav />
    </template>

    <template #aside-outline-before>
      <GalleryAsideOutline />
    </template>

    <template #aside-outline-after>
      <DocAsideScientistSketch />
    </template>
  </DefaultLayout>
</template>
