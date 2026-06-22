# Just a Calculator

A browser extension that replaces every instance of the word **“AI”** with **“Calculator”** on the pages you visit.

Built with [WXT](https://wxt.dev) + React.

## How it works

The content script walks each page's text nodes (skipping `<script>`, `<style>`, form fields, and other places where editing text would break things) and rewrites any standalone `AI` → `Calculator`, including dotted abbreviations like `A.I`, `A.I.`, and `a.i`. Casing is preserved (`ai`/`a.i` → `calculator`, everything else → `Calculator`), and word boundaries keep words like “rain” or “available” untouched. A `MutationObserver` handles content loaded later (SPAs, infinite scroll).

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
