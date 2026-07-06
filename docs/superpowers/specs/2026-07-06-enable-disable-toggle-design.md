# Design Doc: Enable/Disable Toggle Switch

Introduce a toggle switch in the popup of the "Just a Calculator" extension to allow users to enable or disable the text replacement functionality.

## Requirements

1. **Enable/Disable State**: A setting `local:isEnabled` stored in extension storage.
2. **Default State**: Enabled (`true`).
3. **Popup Toggle**: A toggle switch in the popup header to turn the extension on or off.
4. **Visual Dimming**: When disabled, the popup's scoreboard and details are dimmed, and a message prompts the user to reload the page to see changes.
5. **Content Script Bypass**: If disabled, the content script does not run on newly loaded pages. Toggling the extension does not immediately restore text on already loaded pages (user refresh is required, as chosen by the user).

---

## Technical Design

### 1. Storage Configuration

We will use WXT's storage API (built-in storage utility matching the WXT storage structure) to store and retrieve the state:
- **Key**: `local:isEnabled`
- **Type**: `boolean`
- **Default**: `true`

### 2. Content Script (`entrypoints/content.ts`)

- In the `main()` function:
  1. Retrieve `local:isEnabled` from storage (fallback: `true`).
  2. If it is `false`, return immediately without setting up replacement logic or `MutationObserver`.
  
```typescript
const isEnabled = await storage.getItem<boolean>('local:isEnabled', { fallback: true });
if (!isEnabled) {
  return;
}
```

### 3. Popup UI & Styling (`entrypoints/popup/App.tsx`)

- **State Management**:
  - React state `isEnabled` (loaded and watched from `local:isEnabled`).
- **Layout**:
  - The header uses flexbox to position the title/subtitle on the left and the toggle switch on the right.
- **Component**:
  - A modern, accessible switch element:
    ```tsx
    <button
      role="switch"
      aria-checked={isEnabled}
      className={`toggle-switch ${isEnabled ? 'active' : ''}`}
      onClick={handleToggle}
      aria-label="Toggle extension"
    >
      <span className="toggle-knob" />
    </button>
    ```
- **Visual Feedback**:
  - When disabled (`isEnabled === false`), apply a `.disabled-state` CSS class to the popup root or the dynamic sub-sections (`.counter`, `.examples`, `.quote`) which reduces their opacity to `0.5` and changes cursor pointers.
  - Show a small helper notice at the bottom or top when disabled: *"Refresh page to apply changes."*

### 4. Styles (`entrypoints/popup/App.css` & `style.css`)

Add CSS styles for `.toggle-switch` and `.toggle-knob`:
- Track size: 40px width, 20px height, fully rounded borders.
- Knob: 16px circular knob, transitioning horizontally.
- Colors matching existing palette: `--accent` when active, `--border` when inactive.

---

## Verification Plan

### Automated / Static Tests
- Run `pnpm compile` to check that TypeScript compiles successfully.

### Manual Verification
1. **Initial State**: Verify the extension is active by default.
2. **Toggle Off**: Open the popup, click the toggle to disable it.
3. **Popup Dimming**: Verify the popup scoreboard dims and shows the reload notice.
4. **Behavior on New Pages**: Navigate to a new website with AI terms (e.g. Wikipedia's Artificial Intelligence page). Confirm terms are NOT replaced.
5. **Toggle On**: Click the toggle to enable it.
6. **Behavior**: Reload the page, confirm AI terms are now replaced and the popup scoreboard updates.
