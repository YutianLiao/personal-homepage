<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useData, withBase } from "vitepress";
import DefaultLayout from "vitepress/dist/client/theme-default/Layout.vue";
import HomeMathPiece from "./components/HomeMathPiece.vue";
import HomeVPHomeFeatures from "./components/HomeVPHomeFeatures.vue";

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
  if (p.startsWith("/interest-journey/")) return "journey";
  if (p === "/miscellaneous") return "misc";
  return null;
});

const heroName = computed(() => {
  const h = frontmatter.value.hero as { name?: string } | undefined;
  return h?.name;
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
  <DefaultLayout>
    <template v-if="isHome" #home-hero-info>
      <h1 class="heading vp-hero-with-mascot">
        <div class="vp-hero-top-row">
          <div class="vp-hero-titles">
            <span v-if="heroName" class="name clip" v-html="heroName"></span>
            <span v-if="heroText" class="text" v-html="heroText"></span>
          </div>
          <figure class="vp-hero-mascot-wrap">
            <img
              class="vp-home-hero-mascot"
              :src="withBase('/decorative/home-hero.png')"
              alt=""
              loading="lazy"
              @error="hideBroken"
            />
          </figure>
        </div>
      </h1>
      <p v-if="heroTagline" class="tagline vp-hero-tagline-comment">
        <span class="vp-hero-comment-pipe" aria-hidden="true">|</span>
        <span v-html="heroTagline"></span>
      </p>
      <p class="vp-hero-math-euler" aria-hidden="true">
        <span class="vp-hero-math-formula">e<sup>i&pi;</sup> + 1 = 0</span>
      </p>
    </template>

    <template v-if="isHome" #home-hero-actions-after>
      <div class="vp-hero-actions-with-sudoku">
        <HomeMathPiece name="sudoku" />
      </div>
    </template>

    <!-- Replace default-home features grid: interactive Biography + same layout (built-in VPFeatures stays hidden via CSS). -->
    <template v-if="isHome" #home-features-before>
      <div class="home-features-custom">
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
</template>
