# Stage 1 - JS-View Development Summary

> **Document Date**: December 10, 2025  
> **Project**: JS-View - JavaScript Event Loop Visualizer  
> **Status**: MVP Complete

---

## 📋 Project Overview

**JS-View** is an educational web application that helps developers understand JavaScript's **Event Loop**, **Call Stack**, **Microtasks**, and **Macrotasks** through an interactive block-based programming interface.

Users can:
1. **Select blocks** from a palette representing different JS constructs
2. **Drag and reorder** blocks in an execution thread sandbox
3. **View generated code** in real-time with syntax highlighting

---

## 🛠️ Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vite** | 6.2.4 | Build tool & dev server |
| **React** | 19.1.0 | UI library |
| **TypeScript** | 5.8.2 | Type safety |
| **Redux Toolkit** | 2.6.1 | State management |

### Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| **TailwindCSS** | 4.1.17 | Utility-first CSS |
| **tailwind-merge** | 3.4.0 | Class name merging |
| **clsx** | 2.1.1 | Conditional class names |

### UI Components & Libraries
| Technology | Version | Purpose |
|------------|---------|---------|
| **@base-ui-components/react** | 1.0.0-rc.0 | Base UI components (Tooltip, Button) |
| **@dnd-kit/core** | 6.3.1 | Drag and drop core |
| **@dnd-kit/sortable** | 10.0.0 | Sortable list functionality |
| **lucide-react** | 0.556.0 | Icon library |
| **react-syntax-highlighter** | 16.1.0 | Code syntax highlighting |

### Development & Testing
| Technology | Purpose |
|------------|---------|
| **Vitest** | Unit testing |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |

---

## 📁 Project Architecture

```
src/
├── App.tsx                 # Root component - Layout orchestration
├── main.tsx                # React entry point with Redux Provider
├── vite-env.d.ts           # Vite environment types
│
├── store/                  # Redux Store Configuration
│   ├── index.ts            # Store setup with reducers
│   └── hooks.ts            # Typed useAppDispatch & useAppSelector
│
├── domain/                 # Domain Layer (Types & Business Logic)
│   ├── blocks/
│   │   └── types.ts        # BlockType, BlockCategory, BlockDefinition
│   └── program/
│       ├── types.ts        # ProgramBlockInstance
│       └── codegen.ts      # Code generation from blocks
│
├── features/               # Feature-based modules
│   ├── blocks/             # Block palette feature
│   │   ├── BlockList.tsx   # Available blocks UI
│   │   ├── blocksSlice.ts  # Blocks Redux slice
│   │   └── blocksVisuals.ts # Visual config per block type
│   ├── program/            # Execution thread feature
│   │   ├── ProgramSandBox.tsx      # Drag-and-drop sandbox
│   │   ├── SortableProgramBlock.tsx # Sortable block wrapper
│   │   └── programSlice.ts         # Program Redux slice
│   └── code-panel/         # Code output feature
│       └── GeneratedCodePanel.tsx  # Syntax-highlighted output
│
├── components/             # Reusable UI components
│   ├── block/
│   │   └── Block.tsx       # Block card component
│   └── tooltip/
│       └── BlockTooltip.tsx # Info tooltip component
│
├── styles/
│   └── global.css          # Tailwind theme & custom CSS
│
└── utils/
    └── cn.ts               # ClassName utility (clsx + twMerge)
```

---

## 🧩 Domain Types

### Block Types
```typescript
// src/domain/blocks/types.ts

export type BlockType = 'console' | 'forLoop' | 'promiseThen' | 'asyncAwait' | 'timeout'
export type BlockCategory = 'sync' | 'microtask' | 'macrotask' | 'loop'

export type BlockDefinition = {
    id: BlockType
    type: BlockType
    title: string
    description: string
    category: BlockCategory
    exampleCode?: string
    complexityLevel?: 1 | 2 | 3
}
```

### Program Types
```typescript
// src/domain/program/types.ts

export type ProgramBlockInstance = {
    instanceId: string    // Unique ID (nanoid)
    blockId: BlockType    // Reference to block definition
    sequence: number      // Order of creation (for label generation)
}
```

---

## 🎯 Available Blocks (MVP)

| Block | Type | Category | Description |
|-------|------|----------|-------------|
| **console.log** | `console` | sync | Synchronous block - executes directly on call stack |
| **Promise.resolve().then()** | `promiseThen` | microtask | Adds callback to microtask queue |
| **For Loop** | `forLoop` | loop | Synchronous loop - runs immediately |
| **setTimeout** | `timeout` | macrotask | Schedules callback in macrotask queue |
| **Async Await** | `asyncAwait` | microtask | Pauses execution until promise resolves |

---

## 🔄 State Management (Redux)

### Store Structure
```typescript
{
  blocks: {
    available: BlockDefinition[]  // Predefined block definitions
  },
  program: {
    blocks: ProgramBlockInstance[]  // User's executed blocks
    nextSequence: number            // Counter for label generation
  }
}
```

### Actions

| Slice | Action | Description |
|-------|--------|-------------|
| `program` | `addProgramBlock(blockId)` | Adds block instance to program |
| `program` | `removeProgramBlock(instanceId)` | Removes block from program |
| `program` | `reorderProgramBlock({fromIndex, toIndex})` | Reorders blocks via drag-and-drop |

### Selectors

| Selector | Description |
|----------|-------------|
| `selectBlockDefinitions` | Returns all available block definitions |
| `selectProgramBlocks` | Returns current program block instances |
| `selectProgramBlocksWithDefinitions` | Returns instances merged with their definitions |

---

## 🎨 Visual Design System

### Color Palette (Tailwind Theme)
```css
/* Background Colors */
--color-bg-app: #050814          /* Main app background */
--color-bg-panel: #0d1117        /* Panel background */
--color-bg-block: #111827        /* Block container */
--color-bg-block-hover: #1f2937  /* Block hover state */

/* Accent Colors (per block type) */
--color-accent-console: #4fd5ff      /* Cyan */
--color-accent-forLoop: #4fb5ff      /* Blue */
--color-accent-timeout: #f8c56a      /* Gold */
--color-accent-promiseThen: #b56cff  /* Purple */
--color-accent-asyncAwait: #b52cff   /* Violet */

/* Text Colors */
--color-text-primary: #e5e7eb    /* Main text */
--color-text-muted: #9ca3af      /* Secondary text */
```

### Block Visuals
Each block type has associated:
- **Icon** (Lucide React icon)
- **Accent background class**
- **Border gradient class**
- **Glow shadow effect**

---

## ⚙️ Key Functions

### Code Generation
```typescript
// src/domain/program/codegen.ts

function sequenceToLabel(sequence: number): string
// Converts sequence numbers to alphabetic labels (0→A, 1→B, 26→AA)

function generateProgramCode(instances, definitions): string
// Generates JavaScript code from program blocks
```

**Generated Code Examples:**
- `console` → `console.log("A");`
- `forLoop` → `for (let i = 0; i < 2; i++) { console.log("For Loop: A"); }`
- `timeout` → `setTimeout(() => { console.log("setTimeout A"); }, 1);`
- `promiseThen` → `Promise.resolve("_").then(() => { console.log("Promise A"); });`
- `asyncAwait` → `async function runA() { ... } runA();`

### Utility Functions
```typescript
// src/utils/cn.ts
export function cn(...inputs: ClassValue[])
// Combines clsx and tailwind-merge for class name management
```

---

## 🖥️ Main Components

### `App.tsx`
- Root layout component
- Renders three main sections side by side:
  1. `BlockList` - Available blocks palette
  2. `ProgramSandBox` - Execution thread with drag-and-drop
  3. `GeneratedCodePanel` - Syntax-highlighted code output

### `BlockList.tsx`
- Displays all available block definitions
- Clicking a block adds it to the program

### `ProgramSandBox.tsx`
- Uses `@dnd-kit` for drag-and-drop sorting
- Displays program blocks with remove functionality
- Handles `DragEndEvent` to reorder blocks

### `SortableProgramBlock.tsx`
- Wrapper for blocks in the sortable list
- Provides drag handle and delete button

### `GeneratedCodePanel.tsx`
- Uses `react-syntax-highlighter` with Prism
- Real-time code generation from program state

### `Block.tsx`
- Reusable block card component
- Renders icon, title, and description
- Visual styling based on block type

---

## 📜 NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start development server |
| `start` | `vite` | Alias for dev |
| `build` | `tsc -b && vite build` | Type check and production build |
| `preview` | `vite preview` | Preview production build |
| `test` | `vitest --run` | Run unit tests |
| `lint` | `eslint .` | Run ESLint |
| `lint:fix` | `eslint --fix .` | Fix linting issues |
| `format` | `prettier --write .` | Format code |
| `format:check` | `prettier --check .` | Check formatting |
| `type-check` | `tsc -b --noEmit` | Type checking only |

---

## 🗂️ File Summary

| Path | Lines | Purpose |
|------|-------|---------|
| `src/App.tsx` | 17 | Root layout |
| `src/main.tsx` | 24 | React/Redux entry |
| `src/store/index.ts` | 17 | Redux store config |
| `src/store/hooks.ts` | 7 | Typed Redux hooks |
| `src/domain/blocks/types.ts` | 13 | Block type definitions |
| `src/domain/program/types.ts` | 8 | Program instance types |
| `src/domain/program/codegen.ts` | 72 | Code generation logic |
| `src/features/blocks/blocksSlice.ts` | 74 | Blocks Redux slice |
| `src/features/blocks/blocksVisuals.ts` | 53 | Block visual mapping |
| `src/features/blocks/BlockList.tsx` | 32 | Block palette UI |
| `src/features/program/programSlice.ts` | 83 | Program Redux slice |
| `src/features/program/ProgramSandBox.tsx` | 62 | Drag-and-drop sandbox |
| `src/features/program/SortableProgramBlock.tsx` | 40 | Sortable block wrapper |
| `src/features/code-panel/GeneratedCodePanel.tsx` | 44 | Code output panel |
| `src/components/block/Block.tsx` | 57 | Block card component |
| `src/components/tooltip/BlockTooltip.tsx` | 50 | Tooltip component |
| `src/styles/global.css` | 62 | Theme & custom CSS |
| `src/utils/cn.ts` | 7 | Class name utility |

---

## 🚀 Future Improvements (Suggested)

1. **Event Loop Visualization** - Animate call stack, microtask queue, macrotask queue
2. **Step-by-step Execution** - Show execution order with animations
3. **Custom Block Parameters** - Allow users to customize block behavior
4. **Nested Blocks** - Support blocks containing other blocks (e.g., Promise.then with inner console.log)
5. **Execution Output Panel** - Show console output in sequence
6. **Tutorial/Hints** - Interactive explanations of event loop concepts
7. **Export/Share** - Save and share program configurations
8. **More Block Types** - setInterval, queueMicrotask, requestAnimationFrame

---

## 📚 Dependencies Graph

```mermaid
graph TD
    A[App.tsx] --> B[BlockList]
    A --> C[ProgramSandBox]
    A --> D[GeneratedCodePanel]
    
    B --> E[Block Component]
    B --> F[blocksSlice]
    B --> G[programSlice]
    
    C --> H[SortableProgramBlock]
    C --> G
    C --> I[@dnd-kit]
    
    H --> E
    
    D --> J[codegen.ts]
    D --> K[react-syntax-highlighter]
    
    E --> L[blocksVisuals.ts]
    E --> M[cn utility]
    
    F --> N[domain/blocks/types]
    G --> N
    G --> O[domain/program/types]
    
    J --> N
    J --> O
```

---

> **This document serves as a memory snapshot of Stage 1 development. Use it as reference for future improvements and onboarding.**
