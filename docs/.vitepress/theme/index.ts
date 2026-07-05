import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import LearningModuleDoc from "./LearningModuleDoc.vue";
import KnowledgeMap from "./components/KnowledgeMap.vue";
import DemoTokenizerLoader from "./components/demos/DemoTokenizerLoader.vue";
import HomeMathPiece from "./components/HomeMathPiece.vue";
import MiscFamilyGallery from "./components/MiscFamilyGallery.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("learning-module-doc", LearningModuleDoc);
    app.component("KnowledgeMap", KnowledgeMap);
    app.component("demo-tokenizer", DemoTokenizerLoader);
    app.component("HomeMathPiece", HomeMathPiece);
    app.component("MiscFamilyGallery", MiscFamilyGallery);
  }
};
