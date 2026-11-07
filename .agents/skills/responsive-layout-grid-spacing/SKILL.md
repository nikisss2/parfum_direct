---
name: responsive-layout-grid-spacing
description: "Master guide to responsive layout grids, 4/8px spacing systems, viewport breakpoints (mobile 375px, tablet 768px, desktop 1440px), and readable measure (line lengths 60-75 chars). Use when building or tuning page layouts, margins, gutters, and component padding."
---

# Responsive Layout, Grids & 4/8px Spacing System

## Spacing System

# Spacing System
You are an expert in creating systematic spacing for consistent, harmonious interfaces.
## What You Do
You create spacing systems that bring consistency and rhythm to layouts.
## Base Unit
Choose a base unit (typically 4px or 8px) and build a scale:
- 2xs: 2px
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px
## Spacing Types
- **Inset**: Padding inside containers (equal or squish/stretch variants)
- **Stack**: Vertical space between stacked elements
- **Inline**: Horizontal space between inline elements
- **Grid gap**: Space between grid/flex items
## Application Rules
- Related items: smaller spacing (sm/md)
- Distinct sections: larger spacing (lg/xl)
- Page margins: consistent per breakpoint
- Component internal: defined per component
## Density Modes
- Compact: reduce spacing by one step (for data-heavy views)
- Comfortable: default spacing
- Spacious: increase spacing by one step (for reading-focused)
## Best Practices
- Always use the scale — never arbitrary values
- Consistent spacing within components
- Larger gaps between unrelated groups
- Document spacing intent, not just values
- Test spacing at different viewport sizes

---

## Layout Grid

# Layout Grid
You are an expert in layout grid systems for digital product design.
## What You Do
You define responsive grid systems that create consistent, flexible page layouts across breakpoints.
## Grid Anatomy
- **Columns**: Typically 4 (mobile), 8 (tablet), 12 (desktop)
- **Gutters**: Space between columns (16px, 24px, or 32px typical)
- **Margins**: Outer page margins (16px mobile, 24-48px desktop)
- **Breakpoints**: Points where layout adapts (e.g., 375, 768, 1024, 1440px)
## Grid Types
- **Column grid**: Equal columns for general layout
- **Modular grid**: Columns + rows creating modules
- **Baseline grid**: Vertical rhythm alignment (4px or 8px)
- **Compound grid**: Overlapping grids for complex layouts
## Responsive Behavior
- Fluid: columns stretch proportionally
- Fixed: max-width container with centered content
- Adaptive: distinct layouts per breakpoint
- Column dropping: reduce columns at smaller sizes
## Common Patterns
- Full-bleed: content spans entire viewport
- Contained: max-width with margins
- Asymmetric: sidebar + main content
- Card grids: auto-fill responsive cards
## Best Practices
- Use consistent gutters and margins
- Align content to the grid, not arbitrarily
- Test at every breakpoint, not just the extremes
- Document grid specs for developers
- Allow intentional grid-breaking for emphasis

---

## Responsive Design

# Responsive Design
You are an expert in designing interfaces that adapt gracefully across devices and contexts.
## What You Do
You design adaptive layouts and interactions that work across all screen sizes, pixel densities, and input methods.
## Responsive Strategies
- **Fluid**: Percentage-based widths, flexible within ranges
- **Adaptive**: Distinct layouts at specific breakpoints
- **Mobile-first**: Start with smallest, enhance upward
- **Content-first**: Let content needs drive breakpoints
## Common Breakpoints
- Small: 375-639px (phones)
- Medium: 640-1023px (tablets)
- Large: 1024-1439px (laptops)
- Extra large: 1440px+ (desktops)
## Responsive Patterns
- Column drop: reduce columns at smaller sizes
- Reflow: stack horizontal elements vertically
- Off-canvas: hide secondary content behind toggle
- Priority+: show most important, overflow the rest
## Input Method Adaptation
- Touch: 44px minimum targets, gesture support
- Mouse: hover states, precise targeting
- Keyboard: focus indicators, logical tab order
- Voice: clear labels, logical structure
## Responsive Typography and Images
- Fluid type scaling between breakpoints
- Responsive images with appropriate srcset
- Art direction: different crops per breakpoint
## Best Practices
- Design for content, not devices
- Test on real devices, not just browser resize
- Consider landscape and portrait
- Account for slow connections
- Test with accessibility tools at each breakpoint

---

## Readable Measure

# Readable Measure
You are an expert in typographic measure and its effect on reading comfort and comprehension.
## What You Do
You apply the principle of readable measure to ensure text columns are sized for comfortable, uninterrupted reading across devices and type scales.
## The Principle
**Measure** is the length of a line of text. The optimal range is **45–75 characters per line** (including spaces), with 66 characters often cited as the ideal.
- Below 45 characters: too short — the eye jumps lines too frequently, disrupting rhythm
- Above 75 characters: too long — the eye loses its place returning to the start of the next line
- 45–75 is the target zone for body copy; tighter ranges (50–60) suit sustained reading like articles or docs
## Measuring in Practice
- Use the `ch` CSS unit (width of the `0` glyph) as a rough proxy: `max-width: 65ch`
- Count actual characters in a representative paragraph to validate — `ch` is approximate
- Adjust for typeface: wide faces (Georgia) need narrower columns; condensed faces allow slightly wider
- Display type and short UI strings are exempt — this applies to body copy and reading contexts
## Responsive Behavior
- Single-column mobile: full width is usually fine at 16px+ (rarely exceeds 70 chars on small screens)
- Tablet and desktop: constrain column width explicitly; don't let text stretch to container edge
- Multi-column layouts: each column should independently satisfy the 45–75 rule
## By Context
| Context | Target |
|---|---|
| Long-form articles, docs | 55–70 characters |
| UI body copy, descriptions | 45–65 characters |
| Captions, helper text | 40–60 characters |
| Pull quotes, callouts | 30–45 characters |
## Best Practices
- Set `max-width` on text containers, not just font size
- Increase line-height slightly as column width grows (wider measure needs more leading)
- Test with real content — synthetic lorem obscures measure problems
- Revisit measure whenever typeface or type size changes
