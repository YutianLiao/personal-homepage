import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import HelloAgentEmbed from "./components/HelloAgentEmbed.vue";
import MiscFamilyGallery from "./components/MiscFamilyGallery.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("HelloAgentEmbed", HelloAgentEmbed);
    app.component("MiscFamilyGallery", MiscFamilyGallery);
  }
};
