<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useData, withBase } from "vitepress";
import DefaultLayout from "vitepress/dist/client/theme-default/Layout.vue";
import HomeMathPiece from "./components/HomeMathPiece.vue";
import HomeVPHomeFeatures from "./components/HomeVPHomeFeatures.vue";
import HomeUniversityMarks from "./components/HomeUniversityMarks.vue";
import NavMissionVerse from "./components/NavMissionVerse.vue";
import SiteScaleViewport from "./components/SiteScaleViewport.vue";

type DecorKey = "journey" | "misc";

const route = useRoute();
const { frontmatter, site } = useData();

/** Strip VitePress `base` so `/personal-homepage/` becomes `/` on GitHub Pages. */
const normalizedPath = computed(() => {
  const base = site.value.base.replace(/\/$/, "");
  let p = route.path.replace(/\/$/, "") || "/";
  if (base && (p === base || p.startsWith(`${base}/`))) {
    p = p.slice(base.length) || "/";
  }
  if (p.endsWith("/index.html")) {
    p = p.replace(/\/index\.html$/, "") || "/";
  }
  return p.startsWith("/") ? p : `/${p}`;
});

const isHome = computed(() => frontmatter.value.layout === "home");

const decorMode = computed((): DecorKey | null => {
  const p = normalizedPath.value;
  if (p === "/interest-journey/learning-archive") return "journey";
  if (p === "/miscellaneous") return "misc";
  return null;
});

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
  <SiteScaleViewport>
  <DefaultLayout>
    <template #nav-bar-content-before>
      <NavMissionVerse />
    </template>

    <template v-if="isHome" #home-hero-info>
      <div class="hero-sketch-sudoku" aria-hidden="true">
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
        <HomeUniversityMarks />
        <HomeMathPiece name="formulas" />
        <HomeVPHomeFeatures />
      </div>
    </template>

    <template #layout-bottom>
      <div v-if="decorMode" class="vp-corner-decorations" aria-hidden="true">
        <template v-if="decorMode === 'journey'">
          <img
            class="corner-deco corner-deco--left-soft"
            :src="withBase('/decorative/journey-left.png')"
            alt=""
            @error="hideBroken"
          />
          <img
            class="corner-deco corner-deco--right-btm"
            :src="withBase('/decorative/journey-right.png')"
            alt=""
            @error="hideBroken"
          />
        </template>
        <template v-else>
          <img
            class="corner-deco corner-deco--misc-bl"
            :src="withBase('/decorative/misc-left.png')"
            alt=""
            @error="hideBroken"
          />
          <img
            class="corner-deco corner-deco--misc-tr"
            :src="withBase('/decorative/misc-right.png')"
            alt=""
            @error="hideBroken"
          />
        </template>
      </div>
    </template>
  </DefaultLayout>
  </SiteScaleViewport>
</template>
