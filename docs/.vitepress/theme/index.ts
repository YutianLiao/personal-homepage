import { defineAsyncComponent } from "vue";
import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import LearningModuleDoc from "./LearningModuleDoc.vue";
import HomeMathPiece from "./components/HomeMathPiece.vue";
import MiscFamilyGallery from "./components/MiscFamilyGallery.vue";
import "./custom.css";
import "./site-scale.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("learning-module-doc", LearningModuleDoc);
    app.component(
      "demo-tokenizer",
      defineAsyncComponent(
        () => import("./components/demos/DemoTokenizerLoader.vue")
      )
    );
    app.component(
      "demo-sudoku",
      defineAsyncComponent(
        () => import("./components/demos/DemoSudokuLoader.vue")
      )
    );
    app.component(
      "knowledge-planet",
      defineAsyncComponent(
        () => import("./components/knowledge-planet/KnowledgePlanetLoader.vue")
      )
    );
    app.component("HomeMathPiece", HomeMathPiece);
    app.component("MiscFamilyGallery", MiscFamilyGallery);
  }
};
