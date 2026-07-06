# Enable/Disable Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a toggle button in the extension popup to enable or disable the AI-to-Calculator replacement script, with visual feedback in the popup UI.

**Architecture:** Use a `local:isEnabled` key in extension local storage to control state. The content script reads this key on load and exits early if it is `false`. The popup reads/updates this key, shows a styled toggle switch, and dims components if disabled.

**Tech Stack:** WXT, React, TypeScript, CSS

## Global Constraints
- Only permission requested: `storage`.
- Keep layout responsive and accessible (WCAG AA compliant).
- Run `pnpm compile` for static type verification.

---

### Task 1: Update Content Script to Respect Toggle State

**Files:**
- Modify: [entrypoints/content.ts](file:///Users/ben/ghq/github.com/Benjaminlooi/calculator2/entrypoints/content.ts)

**Interfaces:**
- Consumes: `local:isEnabled` value from storage (boolean, defaults to `true`).
- Produces: Early exit in content script when disabled.

- [ ] **Step 1: Modify the `main` entrypoint of the content script**

Update the entrypoint in [entrypoints/content.ts](file:///Users/ben/ghq/github.com/Benjaminlooi/calculator2/entrypoints/content.ts) around lines 125-130 to fetch `local:isEnabled` and only run if it is `true`.

Target Content:
```typescript
    if (location.protocol.endsWith('-extension:')) return;

    // Elements whose text we must not touch: editing fields, embedded
```

Replacement Content:
```typescript
    if (location.protocol.endsWith('-extension:')) return;

    void storage.getItem<boolean>('local:isEnabled', { fallback: true }).then((isEnabled) => {
      if (!isEnabled) return;
      run();
    });

    return; // Stop synchronous execution of the original DOM loader wrapper

    // Note: The rest of the setup helper functions (isSkippable, replacements, etc.)
    // remain defined synchronously. We move the run wrapper below.
```
Wait, let's verify if `run()` and other functions are defined inside the scope of `main()`. Yes, they are.
So let's be extremely precise about how the content script is modified.
Let's see: the original content script structure is:
```typescript
  main() {
    if (location.protocol.endsWith('-extension:')) return;
    
    // helper functions...
    
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
  }
```

If we wrap the execution block at the end in the storage check, we have:
Target Content:
```typescript
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
```

Replacement Content:
```typescript
    function run(): void {
      if (!document.body) return;
      replaceIn(document.body);
      startObserver();
    }

    void storage.getItem<boolean>('local:isEnabled', { fallback: true }).then((isEnabled) => {
      if (!isEnabled) return;
      if (document.body) {
        run();
      } else {
        document.addEventListener('DOMContentLoaded', run, { once: true });
      }
    });
```

Let's specify this exact replacement block in the step.

- [ ] **Step 2: Run `pnpm compile` to verify there are no compilation errors**

Run: `pnpm compile`
Expected: Passes with no typescript compilation errors.

- [ ] **Step 3: Commit changes**

```bash
git add entrypoints/content.ts
git commit -m "feat: content script respects local:isEnabled toggle state"
```

---

### Task 2: Add CSS Styles for Toggle Switch and Disabled State

**Files:**
- Modify: [entrypoints/popup/App.css](file:///Users/ben/ghq/github.com/Benjaminlooi/calculator2/entrypoints/popup/App.css)

**Interfaces:**
- Consumes: CSS theme variables (`--accent`, `--border`, `--bg-card`, etc.).
- Produces: CSS rules for `.toggle-switch`, `.toggle-knob`, `.disabled-container`, and `.reload-notice`.

- [ ] **Step 1: Add style rules for the toggle switch and disabled overlays**

Append the following styles to [entrypoints/popup/App.css](file:///Users/ben/ghq/github.com/Benjaminlooi/calculator2/entrypoints/popup/App.css):

```css
/* ── Toggle Switch ──────────────────────────── */

.header-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: var(--border);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  padding: 0;
  transition: background-color 200ms ease, border-color 200ms ease;
  outline: none;
  flex-shrink: 0;
}

.toggle-switch:focus-visible {
  box-shadow: 0 0 0 2px var(--accent);
}

.toggle-switch.active {
  background-color: var(--accent);
  border-color: var(--accent);
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background-color: var(--counter-num);
  border-radius: 50%;
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-knob {
  transform: translateX(20px);
}

/* ── Disabled state dimming ─────────────────── */

.disabled-container {
  opacity: 0.45;
  pointer-events: none;
  filter: grayscale(40%);
  transition: opacity 200ms ease, filter 200ms ease;
}

.reload-notice {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 12px;
  padding: 6px 12px;
  background: var(--bg-card);
  border: 1px dashed var(--border);
  border-radius: 6px;
  animation: fadeIn 200ms ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2: Commit changes**

```bash
git add entrypoints/popup/App.css
git commit -m "style: add CSS styles for toggle switch and disabled states"
```

---

### Task 3: Integrate Toggle Switch in Popup UI

**Files:**
- Modify: [entrypoints/popup/App.tsx](file:///Users/ben/ghq/github.com/Benjaminlooi/calculator2/entrypoints/popup/App.tsx)

**Interfaces:**
- Consumes: WXT storage API.
- Produces: Interactive switch inside the popup and dynamic container class application.

- [ ] **Step 1: Import React state and add local:isEnabled storage logic**

Update the component inside [entrypoints/popup/App.tsx](file:///Users/ben/ghq/github.com/Benjaminlooi/calculator2/entrypoints/popup/App.tsx):

Target Content (lines 53-61):
```typescript
function App() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    storage.getItem<number>(HYPE_KEY, { fallback: 0 }).then((v) => setCount(v));
    const unwatch = storage.watch<number>(HYPE_KEY, (v) => setCount(v ?? 0));
    return unwatch;
  }, []);
```

Replacement Content:
```typescript
function App() {
  const [count, setCount] = useState<number | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  useEffect(() => {
    storage.getItem<number>(HYPE_KEY, { fallback: 0 }).then((v) => setCount(v));
    const unwatchCount = storage.watch<number>(HYPE_KEY, (v) => setCount(v ?? 0));

    storage.getItem<boolean>('local:isEnabled', { fallback: true }).then((v) => setIsEnabled(v));
    const unwatchEnabled = storage.watch<boolean>('local:isEnabled', (v) => setIsEnabled(v ?? true));

    return () => {
      unwatchCount();
      unwatchEnabled();
    };
  }, []);

  const handleToggle = async () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);
    await storage.setItem('local:isEnabled', nextState);
  };
```

- [ ] **Step 2: Update Header layout and add toggle component and conditional layouts**

Target Content (lines 62-84):
```typescript
  return (
    <div className="popup">
      <div className="header">
        <CalcIcon />
        <div className="header-text">
          <h1 className="title">
            AI <span className="arrow">&rarr;</span> Calculator
          </h1>
          <p className="subtitle">
            Every AI buzzword on the page, rewritten. Permanently.
          </p>
        </div>
      </div>

      <div className="counter" role="status" aria-live="polite" aria-busy={count === null}>
        <span className="counter-num">
          {count === null ? '\u2014' : count.toLocaleString()}
        </span>
        <span className="counter-label">
          hype {count === 1 ? 'term' : 'terms'} removed
        </span>
      </div>
```

Replacement Content:
```typescript
  return (
    <div className="popup">
      <div className="header">
        <div className="header-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalcIcon />
            <div className="header-text">
              <h1 className="title">
                AI <span className="arrow">&rarr;</span> Calculator
              </h1>
              <p className="subtitle">
                Every AI buzzword on the page, rewritten. Permanently.
              </p>
            </div>
          </div>
          <button
            role="switch"
            aria-checked={isEnabled}
            className={`toggle-switch ${isEnabled ? 'active' : ''}`}
            onClick={handleToggle}
            aria-label="Toggle extension functionality"
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </div>

      {!isEnabled && (
        <div className="reload-notice" role="status">
          Extension disabled. Refresh pages to restore AI terms.
        </div>
      )}

      <div className={isEnabled ? '' : 'disabled-container'}>
        <div className="counter" role="status" aria-live="polite" aria-busy={count === null}>
          <span className="counter-num">
            {count === null ? '\u2014' : count.toLocaleString()}
          </span>
          <span className="counter-label">
            hype {count === 1 ? 'term' : 'terms'} removed
          </span>
        </div>
```
Wait, we need to close the `div` wrapper for `disabled-container`!
Let's see where the wrapper ends. It should wrap the rest of the content (counter, examples, quote, etc.). Let's check lines 85-107 of `entrypoints/popup/App.tsx`:
```typescript
      <ul className="examples" aria-label="Example term rewrites">
        {EXAMPLES.map(([from, to]) => (
          <li key={from}>
            <code className="from">{from}</code>
            <span className="arrow">&rarr;</span>
            <code className="to">{to}</code>
          </li>
        ))}
      </ul>

      <blockquote className="quote">
        &ldquo;I used to be surrounded by AI startups. Now I&rsquo;m surrounded
        by calculators. Much better.&rdquo;
        <cite>&mdash; definitely not a calculator</cite>
      </blockquote>

      <p className="footer">
        No AIs were harmed in the making of this extension &mdash; there were
        never any AIs.
      </p>
    </div>
  );
```

So let's end the `disabled-container` right before the footer, so the footer doesn't get dimmed (or we can wrap it too, but keeping the footer normal or dimming everything is fine). Let's wrap the counter, examples, and quote, leaving the footer outside of it.
Let's check:
```typescript
      <div className={isEnabled ? '' : 'disabled-container'}>
        <div className="counter" role="status" aria-live="polite" aria-busy={count === null}>
          <span className="counter-num">
            {count === null ? '\u2014' : count.toLocaleString()}
          </span>
          <span className="counter-label">
            hype {count === 1 ? 'term' : 'terms'} removed
          </span>
        </div>

        <ul className="examples" aria-label="Example term rewrites">
          {EXAMPLES.map(([from, to]) => (
            <li key={from}>
              <code className="from">{from}</code>
              <span className="arrow">&rarr;</span>
              <code className="to">{to}</code>
            </li>
          ))}
        </ul>

        <blockquote className="quote">
          &ldquo;I used to be surrounded by AI startups. Now I&rsquo;m surrounded
          by calculators. Much better.&rdquo;
          <cite>&mdash; definitely not a calculator</cite>
        </blockquote>
      </div>

      <p className="footer">
        No AIs were harmed in the making of this extension &mdash; there were
        never any AIs.
      </p>
    </div>
  );
```

This is clean and wraps everything nicely!

- [ ] **Step 3: Run `pnpm compile` to verify there are no compilation errors**

Run: `pnpm compile`
Expected: Passes with no typescript compilation errors.

- [ ] **Step 4: Commit changes**

```bash
git add entrypoints/popup/App.tsx
git commit -m "feat: add toggle switch React component and state mapping in popup"
```
