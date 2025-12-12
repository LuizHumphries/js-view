## Responsive Task Plan (js-view)

This document is a **didactic**, step-by-step plan to make the app **mobile-friendly** (responsivity) without breaking the desktop experience.

It’s written based on your current layout:

- `src/App.tsx` forces a **3-column desktop layout** (`flex-row` + fixed widths).
- Several panels/components use **fixed widths** like `w-68`, `w-92`, `w-56`, `w-44`.
- Some sections are **wide action toolbars** (`SimulationControls`) that won’t fit on mobile.

Because your UI is a “multi-panel workstation” (Blocks + Program + Code + Visualizer), the best mobile UX is usually:

- Desktop/tablet: show many panels at once.
- Mobile: show **one panel at a time** + a **dropdown/tabs** to switch panels.

---

## 0) Goals + Definition of Done

### Goals (what we want)

- On **mobile portrait (360×640)** the app is usable without horizontal scrolling.
- The user can still access:
    - Block list
    - Program builder
    - Generated code
    - Simulation visualizer + controls

### Definition of Done (how you know it worked)

- No horizontal scroll at 360px width.
- Switching panels on mobile is obvious and takes ≤ 2 taps.
- Desktop layout remains visually similar to today.

---

## 1) Quick Audit: What breaks right now (and why)

### A) App layout is hard-coded for desktop

**File:** `src/App.tsx`

- Uses `flex-row` for the main container.
- Middle column has `w-92`.

Why it breaks:

- On mobile, three columns side-by-side will overflow.

### B) Fixed-width panels prevent shrinking

**Files:**

- `src/features/blocks/BlockList.tsx` → `w-68`
- `src/features/simulation/Zone.tsx` → `w-56`
- `src/features/simulation/EventLoopZone.tsx` → `w-44`

Why it breaks:

- Fixed widths ignore small screens.

### C) Simulation inner layout is made of multiple `flex-row` groups

**File:** `src/features/simulation/SimulationVisualizer.tsx`

- The zones are built as rows (`Call Stack` + `Microtask`, then `Web APIs` + `Macrotask`).

Why it breaks:

- Rows with fixed-width cards + gaps can overflow.

### D) Simulation controls toolbar is too wide

**File:** `src/features/simulation/SimulationControls.tsx`

- A row of many icon buttons + slider + autoplay switch.

Why it breaks:

- On mobile it will either wrap badly, overflow, or become too small.

---

## 2) Responsive Strategy (recommended)

### Strategy summary

- **Desktop (md and up)**: keep the current 3-panel layout.
- **Mobile (below md)**: render a **single-panel view** with a **panel switcher** (dropdown).

Why this strategy is good:

- Your app has “too much information” to display simultaneously on mobile.
- For mobile, “one focus area at a time” reduces cognitive load.

### Breakpoints (Tailwind)

You already use Tailwind. Use responsive variants like:

- `md:flex-row` → row layout only at md+.
- `md:hidden` and `hidden md:block` to swap mobile/desktop UIs.

---

## 3) Task Plan

### Task 1 — Make the App shell responsive (layout + scrolling)

**Edit:** `src/App.tsx`

#### What to change

1. Replace `h-screen` with `min-h-dvh` on the outer wrapper.

- Why: mobile browsers have “dynamic UI bars”; `dvh` behaves better.

2. Use column layout by default, row layout on md+.

3. (Optional but recommended) Reduce padding on mobile.

#### Example change (concept)

```tsx
// src/App.tsx (conceptual)
export const App = () => (
  <div className="flex min-h-dvh w-full overflow-hidden bg-bg-app p-2 sm:p-4">
    <div className="flex h-full w-full flex-col gap-3 rounded-2xl border border-accent-promiseThen bg-bg-app p-3 md:flex-row md:gap-4 md:p-4">
      {/* ...content... */}
    </div>
  </div>
)
```

#### Why this helps

- Mobile gets a vertical flow.
- Desktop keeps the row.

---

### Task 2 — Remove “hard fixed width” where it blocks mobile

You don’t need to remove widths completely. The trick is:

- On mobile: `w-full`
- On desktop: keep the width

#### 2.1 Block list

**Edit:** `src/features/blocks/BlockList.tsx`

Current:

- `main` uses `w-68`

Change idea:

```tsx
<main className="flex h-full w-full flex-col items-center gap-4 rounded-b-xl bg-bg-block p-5 sm:w-68">
  {/* blocks */}
</main>
```

#### 2.2 Middle column (Program + Code)

**Edit:** `src/App.tsx`

Current:

- middle column uses `w-92`

Change idea:

```tsx
<div className="flex h-full w-full flex-col gap-4 md:w-92">
  <ProgramSandBox />
  <GeneratedCodePanel />
</div>
```

#### 2.3 Simulation zones

**Edit:**

- `src/features/simulation/Zone.tsx`
- `src/features/simulation/EventLoopZone.tsx`

Current:

- `Zone` uses `w-56`
- `EventLoopZone` uses `w-44`

Change idea:

```tsx
// Zone.tsx
className="flex w-full flex-col ... sm:w-56"

// EventLoopZone.tsx
className="flex w-full flex-col ... sm:w-44"
```

Why this helps:

- On mobile, everything is allowed to shrink and stack.

---

### Task 3 — Mobile panel switcher (dropdown) to swap panels

**Edit:** `src/App.tsx`

#### Why you want this

Even with stacking, showing all panels on mobile becomes a lot of scrolling.
A panel switcher gives a “native app” feel:

- Choose: **Simulation / Program / Code**
- Only that panel renders in the viewport

**Decision we’re implementing:** on mobile, **Blocks is not a panel**. It becomes a **bottom-sheet modal** (Task 3.1), because the primary mobile flow is “open blocks → tap to add → close”.

#### Safe implementation option (HTML `<select>`)

This avoids guessing Base UI’s Select API.

```tsx
import { useMemo, useState } from 'react'

type MobilePanel = 'program' | 'code' | 'simulation'

export const App = () => {
  // Mobile defaults to Event Loop Visualizer
  const [panel, setPanel] = useState<MobilePanel>('simulation')
  const [isBlocksOpen, setIsBlocksOpen] = useState(false)

  const mobilePanelNode = useMemo(() => {
    switch (panel) {
      case 'program':
        return <ProgramSandBox />
      case 'code':
        return <GeneratedCodePanel />
      case 'simulation':
      default:
        return <SimulationVisualizer />
    }
  }, [panel])

  return (
    <div className="flex min-h-dvh w-full bg-bg-app p-2 sm:p-4">
      <div className="flex h-full w-full flex-col gap-3 rounded-2xl border border-accent-promiseThen bg-bg-app p-3 md:flex-row md:gap-4 md:p-4">
        {/* Mobile header */}
        <div className="flex items-center justify-between gap-3 rounded-xl bg-bg-block-hover px-3 py-2 md:hidden">
          <span className="text-xs font-semibold tracking-wide text-text-primary uppercase">
            Panel
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBlocksOpen(true)}
              className="rounded-md bg-bg-block px-2 py-1 text-sm text-text-primary"
            >
              Blocks
            </button>

            <select
              value={panel}
              onChange={(e) => setPanel(e.target.value as MobilePanel)}
              className="rounded-md bg-bg-block px-2 py-1 text-sm text-text-primary"
            >
              <option value="simulation">Simulation</option>
              <option value="program">Program</option>
              <option value="code">Code</option>
            </select>
          </div>
        </div>

        {/* Mobile body: one panel only */}
        <div className="min-h-0 flex-1 md:hidden">{mobilePanelNode}</div>

        {/* Mobile Blocks bottom-sheet */}
        {isBlocksOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* overlay */}
            <button
              type="button"
              aria-label="Close blocks"
              onClick={() => setIsBlocksOpen(false)}
              className="absolute inset-0 bg-black/60"
            />

            {/* sheet */}
            <div className="absolute right-0 bottom-0 left-0 max-h-[85dvh] overflow-hidden rounded-t-2xl border border-border-subtle bg-bg-panel p-3">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold tracking-wide text-text-primary uppercase">
                  Blocks
                </h2>
                <button
                  type="button"
                  onClick={() => setIsBlocksOpen(false)}
                  className="rounded-md bg-bg-block px-2 py-1 text-sm text-text-primary"
                >
                  Close
                </button>
              </div>

              <div className="min-h-0 overflow-y-auto">
                <BlockList />
              </div>
            </div>
          </div>
        )}

        {/* Desktop body: keep the 3-panel layout */}
        <div className="hidden h-full w-full gap-4 md:flex">
          <BlockList />
          <div className="flex h-full w-92 flex-col gap-4">
            <ProgramSandBox />
            <GeneratedCodePanel />
          </div>
          <SimulationVisualizer />
        </div>
      </div>
    </div>
  )
}
```

#### “Why this works” (didactic)

- `md:hidden` means “hide on desktop”.
- `hidden md:flex` means “show on desktop only”.
- You avoid the hardest part of mobile multi-panel design: fitting everything.

#### Task 3.1 — Why Blocks should be a bottom-sheet on mobile (and not a panel)

- **Space**: blocks are a “toolbox”, not the main canvas. A sheet uses space only when needed.
- **Flow**: open → tap block to add → close. You don’t need to keep the toolbox visible.
- **Consistency**: many mobile apps use sheets for secondary tools.

---

### Task 4 — Make the Simulation inner layout responsive (grid instead of fixed rows)

**Edit:** `src/features/simulation/SimulationVisualizer.tsx`

#### What to change

Currently you have:

- `Call Stack` and `Microtask Queue` in a row
- `Web APIs` and `Macrotask Queue` in another row

On mobile, switch to a grid:

- 1 column on mobile
- 2 columns on small tablets

#### Example idea

Replace the two `flex flex-row ...` blocks with one grid wrapper:

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
  <Zone title="Call Stack">...</Zone>
  <Zone title="Microtask Queue" variant="microtask">...</Zone>
  <Zone title="Web APIs" variant="webapi">...</Zone>
  <Zone title="Macrotask Queue" variant="macrotask">...</Zone>
</div>
```

Also consider:

- Wrap `EventLoopZone` above the grid on mobile (so it’s not side-by-side).

---

### Task 5 — Make SimulationControls mobile-friendly (dropdown/overflow menu)

**Edit:** `src/features/simulation/SimulationControls.tsx`

#### Recommended UX pattern

- Keep the “Play/Pause” visible.
- Move “Prev/Next/Reset/End + Speed + Autoplay” into a **dropdown menu** on mobile.

#### Implementation option A (pure HTML `<details>`)

```tsx
return (
  <div className="flex items-center gap-2">
    {/* Always visible */}
    <div className="flex items-center gap-2 rounded-full bg-bg-block/70 px-2 py-1">
      {/* keep Play / Pause here */}
    </div>

    {/* Mobile overflow */}
    <details className="relative md:hidden">
      <summary className="cursor-pointer rounded-full bg-bg-block/70 px-3 py-1 text-xs text-text-primary">
        More
      </summary>
      <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border-subtle bg-bg-panel p-3 shadow-lg">
        {/* put prev/next/reset/end + speed + autoplay here */}
      </div>
    </details>

    {/* Desktop full controls */}
    <div className="hidden md:flex md:flex-row md:gap-5">
      {/* existing slider + autoplay */}
    </div>
  </div>
)
```

#### Why this helps

- Mobile header stays clean.
- Advanced controls are still available.

---

### Task 6 — Verify with a concrete test checklist

#### Manual checks

- Mobile portrait (360px):
    - No horizontal scroll
    - Panel switcher works (Simulation / Program / Code)
    - Blocks bottom-sheet opens/closes and you can add blocks from it
    - Each panel is usable (program scrolls, code scrolls, simulation scrolls)

- Small tablet (768px):
    - Desktop layout kicks in (`md:`)
    - The 3-panel layout is still readable

- Desktop:
    - No visual regressions

#### Interaction checks

- Drag & drop in `ProgramSandBox` still works.
- Simulation still plays/pauses and steps correctly.

---

## 4) Extra improvements (optional, after the basics)

- Add a reusable `AppHeader` component (component-driven organization).
- Add a `useMediaQuery` hook so that hidden desktop layout isn’t mounted on mobile.
- Consider a “bottom navigation” on mobile instead of a select dropdown.

---

## Decisions (locked in)

- Mobile shows **only one panel at a time**.
- Default mobile panel is **Event Loop Visualizer**.
- Blocks on mobile is a **bottom-sheet modal** (not a panel).

## Unresolved questions

- None.
