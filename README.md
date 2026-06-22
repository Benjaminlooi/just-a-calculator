# Just a Calculator

> **100% AI-free**. _(This badge is, of course, immediately rewritten to "100% Calculator-free" by the extension itself. That's how you know it's working.)_

A browser extension that replaces every instance of the word **"AI"** — and a few of its friends — with **"Calculator"** (or a suitably deflating alternative) on the pages you visit. Because that's what they all are, when you get right down to it.

Built with [WXT](https://wxt.dev) + React.

## What it actually does

The content script walks each page's text nodes (skipping `<script>`, `<style>`, form fields, and other places where editing text would break things) and rewrites hype terms. Word boundaries keep innocent words like "rain" or "available" untouched, and casing is preserved. A `MutationObserver` handles content loaded later (SPAs, infinite scroll).

A sample of the dictionary:

| Before         | After                            |
| -------------- | -------------------------------- |
| `AI`           | `Calculator`                     |
| `ChatGPT`      | `Chat Calc`                      |
| `AGI`          | `Artificial General Calculator`  |
| `LLM`          | `Large Lossy Multiplication`     |
| `machine learning` | `memorizing`                 |
| `neural network`   | `tangled wire`               |
| `hallucination`    | `feature`                    |
| `prompt engineer`  | `wish-maker`                 |

The popup keeps a running tally — "hype terms removed" — that ticks up live as you browse.

## Trusted by

The world's leading calculator-first organizations _(logos pending)_:

- **CalcHub** — _"Addition at scale."_
- **CloudMathly** — _"Subtraction, but in the cloud."_
- **OpenDivider** — _"Open-source long division."_
- **CalcGPT** — _Wait, no, that one got rewritten too._

## Performance

- Replaces up to **0 AI models** per second.
- Scales horizontally to **0 instances**.
- Inference latency: **also 0** — there is no inference.
- Carbon footprint: a calculator's.

## FAQ (Frequently Asked Calculations)

**Q: Is this an AI extension?**
A: No. It is a calculator. It says so in the name.

**Q: Why is "machine learning" now "memorizing"?**
A: More accurate.

**Q: Where does the hype tally get stored?**
A: In `storage.local`, under `hypeRemoved`. It survives restarts, which is more than can be said for most AI roadmaps.

**Q: Can I turn it off?**
A: You can disable the extension in your browser's extensions page. You cannot, however, turn off the joke.

**Q: Will this fix the hype cycle?**
A: No. But it will make reading about it funnier.

## Develop

```bash
npm install
npm run dev          # Chrome
npm run dev:firefox  # Firefox
```

## Build

```bash
npm run build          # Chrome
npm run build:firefox  # Firefox
```

---

_Powered by Calculator™. No AIs were harmed in the making of this extension — there were never any AIs._
