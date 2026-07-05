import { computed, onMounted, onUnmounted, ref } from "vue";
import type { GraphNode, PreviewEntry, SelectionState } from "./types";

export function useKnowledgeMap() {
  const selection = ref<SelectionState>({
    domainId: null,
    topicId: null,
    nodeId: null
  });
  const hoveredId = ref<string | null>(null);
  const previewEntry = ref<PreviewEntry | null>(null);
  const showAddForm = ref(false);
  const isMobile = ref(false);

  function updateMobile() {
    isMobile.value = window.matchMedia("(max-width: 767px)").matches;
  }

  onMounted(() => {
    updateMobile();
    window.addEventListener("resize", updateMobile);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", updateMobile);
  });

  const focusedDomainId = computed(() => selection.value.domainId);

  function selectNode(node: GraphNode) {
    selection.value = {
      domainId: node.domainId,
      topicId: node.topicId ?? null,
      nodeId: node.id
    };
  }

  function selectDomain(domainId: string) {
    selection.value = {
      domainId,
      topicId: null,
      nodeId: `domain:${domainId}`
    };
  }

  function clearSelection() {
    selection.value = { domainId: null, topicId: null, nodeId: null };
  }

  function isDimmed(node: GraphNode): boolean {
    if (!focusedDomainId.value) return false;
    return node.domainId !== focusedDomainId.value;
  }

  function isHighlighted(node: GraphNode): boolean {
    if (selection.value.nodeId === node.id) return true;
    if (selection.value.topicId && node.topicId === selection.value.topicId) return true;
    return false;
  }

  function setPreview(entry: PreviewEntry | null) {
    previewEntry.value = entry;
    if (entry) {
      selection.value = {
        domainId: entry.domainId,
        topicId: entry.topicId,
        nodeId: null
      };
    }
  }

  return {
    selection,
    hoveredId,
    previewEntry,
    showAddForm,
    isMobile,
    focusedDomainId,
    selectNode,
    selectDomain,
    clearSelection,
    isDimmed,
    isHighlighted,
    setPreview
  };
}
