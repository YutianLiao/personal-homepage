import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import MiscFamilyGallery from "./components/MiscFamilyGallery.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("MiscFamilyGallery", MiscFamilyGallery);
  }
};
