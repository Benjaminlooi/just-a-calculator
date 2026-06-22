export default defineContentScript({
  // Run on every page.
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    // Elements whose text we must not touch: editing fields, embedded
    // code/data, and scripting/invisible elements where swapping text would
    // break behaviour or simply never be seen.
    const SKIP_TAGS = new Set([
      'SCRIPT',
      'STYLE',
      'NOSCRIPT',
      'IFRAME',
      'OBJECT',
      'TEXTAREA',
      'INPUT',
      'SELECT',
      'OPTION',
      'TEMPLATE',
      'SVG',
      'CODE',
      'PRE',
      'KBD',
      'TITLE',
      'META',
    ]);

    // Standalone "AI" with word boundaries, case-insensitive. Using word
    // boundaries keeps us from matching the "ai" inside "rain", "main",
    // "available", etc. Two regexes: one without /g for cheap membership
    // tests (stateless), one with /g for the actual replacement.
    const HAS_AI = /\bAI\b/i;
    const AI_GLOBAL = /\bAI\b/gi;

    /** Map the matched casing onto the replacement. */
    function replacementFor(match: string): string {
      if (match === 'ai') return 'calculator';
      // "AI", "Ai", and any odd case (e.g. "aI") -> capitalized form.
      return 'Calculator';
    }

    /** True if the element (or an ancestor) is a place we shouldn't edit. */
    function isSkippable(el: Element | null): boolean {
      if (!el) return true;
      if (SKIP_TAGS.has(el.tagName)) return true;
      if ((el as HTMLElement).isContentEditable) return true;
      return false;
    }

    function replaceTextInNode(node: Text): void {
      const original = node.nodeValue ?? '';
      const updated = original.replace(AI_GLOBAL, replacementFor);
      if (updated !== original) node.nodeValue = updated;
    }

    /** Find every text node under `root` that contains a standalone "AI". */
    function collectTextNodes(root: Node): Text[] {
      const targets: Text[] = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = (node as Text).parentElement;
          if (isSkippable(parent)) return NodeFilter.FILTER_REJECT;
          return HAS_AI.test(node.nodeValue ?? '')
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      });
      let current: Node | null;
      while ((current = walker.nextNode())) targets.push(current as Text);
      return targets;
    }

    /** Replace every standalone "AI" within `root`. */
    function replaceIn(root: Node): void {
      if (root.nodeType === Node.TEXT_NODE) {
        replaceTextInNode(root as Text);
        return;
      }
      for (const textNode of collectTextNodes(root)) replaceTextInNode(textNode);
    }

    /** Watch for content added/changed after the initial pass (SPAs, etc.). */
    function startObserver(): void {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'characterData') {
            const target = mutation.target as Text;
            if (
              target.nodeType === Node.TEXT_NODE &&
              target.parentElement &&
              !isSkippable(target.parentElement)
            ) {
              replaceTextInNode(target);
            }
            continue;
          }
          for (const added of mutation.addedNodes) {
            if (
              added.nodeType === Node.ELEMENT_NODE ||
              added.nodeType === Node.TEXT_NODE
            ) {
              replaceIn(added);
            }
          }
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    function run(): void {
      if (!document.body) return;
      replaceIn(document.body);
      startObserver();
    }

    if (document.body) {
      run();
    } else {
      document.addEventListener('DOMContentLoaded', run, { once: true });
    }
  },
});
