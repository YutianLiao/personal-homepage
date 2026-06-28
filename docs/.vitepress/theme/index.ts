import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import HelloAgentDoc from "./HelloAgentDoc.vue";
import HomeMathPiece from "./components/HomeMathPiece.vue";
import MiscFamilyGallery from "./components/MiscFamilyGallery.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("hello-agent-doc", HelloAgentDoc);
    app.component("HomeMathPiece", HomeMathPiece);
    app.component("MiscFamilyGallery", MiscFamilyGallery);
  }
};
