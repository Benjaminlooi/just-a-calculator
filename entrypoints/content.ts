// Where the popup keeps its running "hype removed" tally. The content script
// increments it; the popup reads (and watches) it. Lives in local storage so
// each browser profile keeps its own scoreboard.
const HYPE_KEY = 'local:hypeRemoved';
const ENABLED_KEY = 'local:isEnabled';

// A single replacement rule. `has` is a cheap, stateless test used to decide
// whether a text node is even worth opening; `global` does the real work; and
// `replace` maps the matched casing onto the replacement.
type Rule = {
  has: RegExp;
  global: RegExp;
  replace: (match: string) => string;
};

/**
 * Build a replacer that mirrors the casing of the match onto a replacement.
 *  - all-lowercase match ("ai", "gpt") -> lower
 *  - anything else (incl. ALL CAPS)    -> title
 * All-caps is deliberately collapsed to title case: the punchline is "it's
 * just a Calculator", not "it's just a CALCULATOR".
 */
function titled(lower: string, title: string): (m: string) => string {
  return (match) => (match === match.toLowerCase() ? lower : title);
}

// Order matters: more specific rules must run before rules whose pattern they
// contain (e.g. ChatGPT before GPT). Each replacement is also chosen so it
// can't be re-matched by a later rule, so a single forward pass is enough.
const RULES: Rule[] = [
  {
    // The original. "AI" with an optional dot between the letters, so "A.I",
    // "A.I.", "a.i" are caught too. The lookahead keeps us from grabbing the
    // start of a longer dotted acronym ("A.I.D.S") and leaves a trailing
    // sentence period alone ("A.I." -> "Calculator.").
    has: /\bA\.?I\b(?!\.[A-Za-z])/,
    global: /\bA\.?I\b(?!\.[A-Za-z])/gi,
    replace: titled('calculator', 'Calculator'),
  },
  {
    // Full phrase — word boundaries keep it from matching inside "artificial"
    // alone, but we list it early for clarity.
    has: /\bartificial\s+intelligence\b/i,
    global: /\bartificial\s+intelligence\b/gi,
    replace: titled('artificial calculator', 'Artificial Calculator'),
  },
  {
    has: /\bchat\s?gpt\b/i,
    global: /\bchat\s?gpt\b/gi,
    replace: titled('chat calc', 'Chat Calc'),
  },
  {
    has: /\bagi\b/i,
    global: /\bagi\b/gi,
    replace: titled(
      'artificial general calculator',
      'Artificial General Calculator',
    ),
  },
  {
    has: /\bllm\b/i,
    global: /\bllm\b/gi,
    replace: titled('large lossy multiplication', 'Large Lossy Multiplication'),
  },
  {
    has: /\bgpt\b/i,
    global: /\bgpt\b/gi,
    replace: titled('general purpose toaster', 'General Purpose Toaster'),
  },
  {
    // Hyphenated compound — catch "AI-powered" / "AI powered" before standalone
    // AI gets replaced.
    has: /\bA\.?I[\s-]+powered\b/i,
    global: /\bA\.?I[\s-]+powered\b/gi,
    replace: titled('calculator-powered', 'Calculator-powered'),
  },
  {
    has: /\bmachine\s+learning\b/i,
    global: /\bmachine\s+learning\b/gi,
    replace: titled('memorizing', 'Memorizing'),
  },
  {
    has: /\bdeep\s+learning\b/i,
    global: /\bdeep\s+learning\b/gi,
    replace: titled('deep guessing', 'Deep Guessing'),
  },
  {
    has: /\bneural\s+networks?\b/i,
    global: /\bneural\s+networks?\b/gi,
    replace: (m) => (/s\b/i.test(m) ? 'tangled wires' : 'tangled wire'),
  },
  {
    has: /\bhallucinations?\b/i,
    global: /\bhallucinations?\b/gi,
    replace: (m) => (/s\b/i.test(m) ? 'features' : 'feature'),
  },
  {
    has: /\bprompt\s+engineer(?:ing|s)?\b/i,
    global: /\bprompt\s+engineer(?:ing|s)?\b/gi,
    replace: (m) =>
      /ing\b/i.test(m)
        ? 'wish-making'
        : /s\b/i.test(m)
          ? 'wish-makers'
          : 'wish-maker',
  },
  {
    has: /\bgenerative\b/i,
    global: /\bgenerative\b/gi,
    replace: titled('hallucinating', 'Hallucinating'),
  },
  {
    has: /\bdeep\s?fake(?:s)?\b/i,
    global: /\bdeep\s?fake(?:s)?\b/gi,
    replace: (m) => (/s\b/i.test(m) ? 'deep forgeries' : 'deep forgery'),
  },
];

// One quick test for the tree walker: "does this node contain any hype at all?"
const HAS_HYPE = new RegExp(RULES.map((r) => r.has.source).join('|'), 'i');

export default defineContentScript({
  // Run on every page.
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    // Never run on the extension's own pages (the popup, options, etc.). On
    // some browsers `<all_urls>` matches these too, which would rewrite the
    // popup's own copy ("AI -> Calculator" -> "Calculator -> Calculator").
    if (location.protocol.endsWith('-extension:')) return;

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

    /** True if the element (or an ancestor) is a place we shouldn't edit. */
    function isSkippable(el: Element | null): boolean {
      if (!el) return true;
      if (SKIP_TAGS.has(el.tagName)) return true;
      if ((el as HTMLElement).isContentEditable) return true;
      return false;
    }

    // --- Hype scoreboard -----------------------------------------------------
    // Tally replacements in memory and flush to storage on a timer (and on
    // unload) so we don't round-trip to storage on every text node.
    let pending = 0;
    let timer: ReturnType<typeof setInterval> | null = null;

    function flushCount(): void {
      if (pending === 0) return;
      const delta = pending;
      pending = 0;
      void storage
        .getItem<number>(HYPE_KEY, { fallback: 0 })
        .then((cur) => {
          void storage.setItem(HYPE_KEY, cur + delta);
        });
    }

    function noteReplacements(n: number): void {
      pending += n;
      if (timer === null) {
        timer = setInterval(flushCount, 1500);
        window.addEventListener('pagehide', flushCount, { once: true });
      }
    }

    /** Apply every rule to a single text node; return the # of swaps made. */
    function replaceTextInNode(node: Text): number {
      let text = node.nodeValue ?? '';
      let total = 0;
      for (const rule of RULES) {
        text = text.replace(rule.global, (m) => {
          total++;
          return rule.replace(m);
        });
      }
      if (total > 0) node.nodeValue = text;
      return total;
    }

    /** Find every text node under `root` that contains any hype term. */
    function collectTextNodes(root: Node): Text[] {
      const targets: Text[] = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = (node as Text).parentElement;
          if (isSkippable(parent)) return NodeFilter.FILTER_REJECT;
          return HAS_HYPE.test(node.nodeValue ?? '')
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      });
      let current: Node | null;
      while ((current = walker.nextNode())) targets.push(current as Text);
      return targets;
    }

    /** Rewrite every hype term within `root`; tally the swaps. */
    function replaceIn(root: Node): void {
      if (root.nodeType === Node.TEXT_NODE) {
        noteReplacements(replaceTextInNode(root as Text));
        return;
      }
      let delta = 0;
      for (const textNode of collectTextNodes(root)) {
        delta += replaceTextInNode(textNode);
      }
      if (delta > 0) noteReplacements(delta);
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
              noteReplacements(replaceTextInNode(target));
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

    void storage.getItem<boolean>(ENABLED_KEY, { fallback: true }).then((isEnabled) => {
      if (!isEnabled) return;
      if (document.body) {
        run();
      } else {
        document.addEventListener('DOMContentLoaded', run, { once: true });
      }
    });
  },
});
