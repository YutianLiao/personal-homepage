<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useData, withBase } from "vitepress";
import DefaultLayout from "vitepress/dist/client/theme-default/Layout.vue";
import HomeVPHomeFeatures from "./components/HomeVPHomeFeatures.vue";

type DecorKey = "journey" | "misc";

const route = useRoute();
const { frontmatter } = useData();

const isHome = computed(() => {
  const p = route.path.replace(/\/$/, "") || "/";
  return p === "/" || p.endsWith("/index.html");
});

const decorMode = computed((): DecorKey | null => {
  const normalized = route.path.replace(/\/$/, "") || "/";
  if (normalized === "/interest-journey") return "journey";
  if (normalized === "/miscellaneous") return "misc";
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
          <img
            class="vp-home-hero-mascot"
            :src="withBase('/decorative/home-hero.png')"
            alt=""
            loading="lazy"
            @error="hideBroken"
          />
        </div>
      </h1>
      <p v-if="heroTagline" class="tagline vp-hero-tagline-comment">
        <span class="vp-hero-comment-pipe" aria-hidden="true">|</span>
        <span v-html="heroTagline"></span>
      </p>
    </template>

    <!-- Replace default-home features grid: interactive Biography + same layout (built-in VPFeatures stays hidden via CSS). -->
    <template v-if="isHome" #home-features-before>
      <div class="home-features-custom">
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
