# Narraverse Next MVP Development Guidelines

This document outlines the development standards and conventions for the Narraverse Next MVP project. All AI agents and developers should follow these guidelines to ensure code consistency and maintainability.

## 1. Design System & Styling (设计系统与样式)

**CRITICAL**: This project uses a strict semantic design token system based on CSS variables and Tailwind CSS v4. **Do not use hardcoded colors** (e.g., `bg-white`, `text-black`, `bg-zinc-900`) unless absolutely necessary for a one-off case that sits outside the theme system. Always prefer semantic variables to ensure theming support (Light, Dark, Blue, Green, Orange, Red).

### 1.1 Semantic Tokens (语义化变量)

Styles are defined in `app/styles/tokens.css`. Use the following semantic classes:

#### Surfaces (背景与层级)
- **Page Background**: `bg-background` / `text-foreground`
- **Cards / Containers**: `bg-card` / `text-card-foreground`
- **Popovers / Modals**: `bg-popover` / `text-popover-foreground`
- **Sidebar**: `bg-sidebar` / `text-sidebar-foreground`
  - Sidebar specific: `bg-sidebar-primary`, `bg-sidebar-accent`, `border-sidebar-border`

#### Interaction & Status (交互与状态)
- **Primary Action**: `bg-primary` / `text-primary-foreground` (Main buttons, active states)
- **Secondary Action**: `bg-secondary` / `text-secondary-foreground` (Subtle buttons, tags)
- **Muted / Disabled**: `bg-muted` / `text-muted-foreground` (Subtitles, disabled states, placeholders)
- **Accent**: `bg-accent` / `text-accent-foreground` (Hover states, highlights)
- **Destructive**: `bg-destructive` / `text-destructive-foreground` (Error states, delete actions)

#### UI Elements (界面元素)
- **Borders**: `border-border` (Default borders)
- **Inputs**: `border-input` (Input fields)
- **Focus Rings**: `ring-ring` (Focus states) / `ring-sidebar-ring`
- **Border Radius**: Use `rounded-[var(--radius)]` or standard tailwind utilities if they map to it.

#### Data Visualization (数据可视化)
- **Charts**: `bg-chart-1` through `bg-chart-5`

### 1.2 Custom Utilities (自定义工具类)

Defined in `app/styles/utils.css`:
- **Paper Texture**: `.bg-paper-texture` (Adds a subtle noise/paper texture)
- **Letterpress Effect**: `.text-letterpress` (Adds depth to text)
- **Paper Shadows**: `.shadow-paper-sm`, `.shadow-paper-md`, `.shadow-paper-lg`
- **Handwriting Font**: `.font-handwriting` (Caveat, Kalam, etc.)
- **Active Shadow**: `.shadow-active`

### 1.3 Theming (主题)

Themes are implemented via the `data-theme` attribute on the root element and CSS variables using the OKLCH color space.
- **Available Themes**: Default, Blue, Green, Orange, Red.
- **Dark Mode**: Supported via `.dark` class (Tailwind v4 `@custom-variant dark (&:is(.dark *));`).

### 1.4 Styling Best Practices

1.  **Use `cn` for Class Merging**: Always use the `cn` utility from `@/lib/utils` when conditionally applying classes.
    ```tsx
    import { cn } from "@/lib/utils"
    
    <div className={cn("bg-background p-4", className)}>...</div>
    ```
2.  **Avoid Arbitrary Values**: Avoid `w-[123px]` unless strictly required by a design spec that deviates from the grid/spacing system.
3.  **Mobile First**: Write responsive styles starting from mobile (`base`) and scaling up (`md:`, `lg:`).

## 2. Project Structure (项目结构)

- **`app/`**: Next.js App Router directory.
  - `app/styles/`: Global styles (`tokens.css`, `utils.css`, `animations.css`).
  - `app/globals.css`: Main entry point for styles.
- **`components/`**: Reusable React components.
- **`lib/`**: Utility functions and shared logic.
  - `lib/utils.ts`: Common utilities like `cn`.

## 3. Tech Stack & Conventions

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Context / Hooks (inferred)
- **Code Style**:
  - **No Semicolons**: Prefer omitting semicolons where possible.
  - **Imports**: Use clear, grouped imports.
  - **Naming**: PascalCase for components, camelCase for functions/variables, kebab-case for filenames.
