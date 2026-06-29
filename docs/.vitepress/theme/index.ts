import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import LearningModuleDoc from "./LearningModuleDoc.vue";
import TokenizerDemo from "./components/demos/TokenizerDemo.vue";
import HomeMathPiece from "./components/HomeMathPiece.vue";
import MiscFamilyGallery from "./components/MiscFamilyGallery.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("learning-module-doc", LearningModuleDoc);
    app.component("demo-tokenizer", TokenizerDemo);
    app.component("HomeMathPiece", HomeMathPiece);
    app.component("MiscFamilyGallery", MiscFamilyGallery);
  }
};
