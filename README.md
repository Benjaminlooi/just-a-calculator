# Just a Calculator

> **100% AI-free**. _(This badge is, of course, immediately rewritten to "100% Calculator-free" by the extension itself. That's how you know it's working.)_

A browser extension that replaces every instance of the word **"AI"** — and a few of its friends — with **"Calculator"** (or a suitably deflating alternative) on the pages you visit. Because that's what they all are, when you get right down to it.

## Install

- [Chrome Web Store](#)
- [Firefox Add-ons](#)

## What it does

Every AI buzzword on the page gets rewritten. Permanently.

| Before                 | After                            |
| ---------------------- | -------------------------------- |
| `AI`                   | `Calculator`                     |
| `artificial intelligence` | `Artificial Calculator`       |
| `ChatGPT`              | `Chat Calc`                      |
| `AGI`                  | `Artificial General Calculator`  |
| `LLM`                  | `Large Lossy Multiplication`     |
| `GPT`                  | `General Purpose Toaster`        |
| `AI-powered`           | `Calculator-powered`             |
| `machine learning`     | `memorizing`                     |
| `deep learning`        | `deep guessing`                  |
| `neural network`       | `tangled wire`                   |
| `hallucination`        | `feature`                        |
| `prompt engineer`      | `wish-maker`                     |
| `generative`           | `Hallucinating`                  |
| `deepfake`             | `deep forgery`                   |

Casing is preserved, word boundaries are respected, and a `MutationObserver` catches content loaded after the initial page render (SPAs, infinite scroll, etc.).

The popup keeps a running tally — "hype terms removed" — that ticks up live as you browse.

## How it works

The content script walks each page's text nodes (skipping `<script>`, `<style>`, form fields, and other places where editing text would break things) and applies regex-based replacements. The tally is batched in memory and flushed to `storage.local` every 1.5 seconds.

Asks for exactly one permission: `storage`. No network access, no tabs, no tracking.

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
pnpm install
pnpm dev          # Chrome
pnpm dev:firefox  # Firefox
```

## Build

```bash
pnpm build          # Chrome
pnpm build:firefox  # Firefox
```

---

_Powered by Calculator™. No AIs were harmed in the making of this extension — there were never any AIs._
