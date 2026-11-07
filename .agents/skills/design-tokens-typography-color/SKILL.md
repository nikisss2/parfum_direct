---
name: design-tokens-typography-color
description: "Design tokens for typographic scale, color palette architecture, dark mode adaptation (elevation, contrast rebalancing, desaturation), and accessible contrast (WCAG 2.2 AA). Use when establishing design systems or tuning styles."
---

# Design Tokens: Typography Scale, Color Systems & Dark Mode

## Color System

# Color System
You are an expert in building systematic, accessible color palettes for digital products.
## What You Do
You create comprehensive color systems with raw palettes, semantic mapping, and accessibility compliance.
## Color System Layers
### 1. Brand Palette
Primary, secondary, and accent colors with full tonal scales (50-950 or equivalent).
### 2. Neutral Palette
Gray scale for text, backgrounds, borders, and surfaces.
### 3. Semantic Colors
- Success (green), warning (amber), error (red), info (blue)
- Each with background, foreground, border, and icon variants
### 4. Extended Palette
Data visualization colors, illustration colors, gradient definitions.
## Accessibility Requirements
- Text on backgrounds: minimum 4.5:1 contrast (AA) or 7:1 (AAA)
- Large text: minimum 3:1
- UI components: minimum 3:1 against adjacent colors
- Don't rely on color alone to convey meaning
## Color Relationships
- Tint/shade scales for each hue
- Complementary pairs for contrast
- Analogous sets for harmony
- Neutral pairings for text/surface combinations
## Best Practices
- Generate full tonal scales, not just single swatches
- Test every foreground/background combination for contrast
- Provide usage guidance for each color
- Design for color blindness (test with simulators)
- Include dark mode mappings from the start

---

## Dark Mode Design

# Dark Mode Design
You are an expert in designing dark mode interfaces that are comfortable, accessible, and polished.
## What You Do
You design dark mode experiences that go beyond simple color inversion.
## Core Principles
- Reduce overall luminance to decrease eye strain
- Use surface elevation through lighter shades (not shadows)
- Desaturate bright colors for dark backgrounds
- Maintain sufficient contrast for readability
## Surface Hierarchy (Dark Mode)
- Background: darkest (e.g., #121212)
- Surface 1: slightly lighter (elevated cards)
- Surface 2: lighter again (modals, dropdowns)
- Surface 3: lightest dark (tooltips, menus)
## Color Adaptation
- Primary colors: reduce saturation 10-20%
- Error/warning: adjust for dark background contrast
- Text: off-white (#E0E0E0) not pure white (#FFFFFF)
- Borders: subtle, low-opacity white
## Images and Media
- Consider dimming images slightly
- Provide dark-variant illustrations
- Logos may need light-on-dark versions
- Avoid large bright areas in imagery
## Accessibility in Dark Mode
- Minimum 4.5:1 contrast for body text
- Test with screen readers (mode announcements)
- Respect prefers-color-scheme media query
- Provide manual toggle alongside auto-detection
## Best Practices
- Don't just invert — redesign surfaces thoughtfully
- Test in actual dark environments
- Check every component in dark mode
- Smooth transitions between modes
- Use semantic tokens for effortless switching

---

## Typography Scale

# Typography Scale
You are an expert in typographic systems for digital interfaces.
## What You Do
You create modular typography scales that ensure readable, harmonious, and consistent text across a product.
## Scale Components
### Size Scale
Based on a ratio (e.g., 1.25 major third, 1.333 perfect fourth):
- Caption: 12px
- Body small: 14px
- Body: 16px (base)
- Subheading: 20px
- Heading 3: 24px
- Heading 2: 32px
- Heading 1: 40px
- Display: 48-64px
### Weight Scale
Regular (400), Medium (500), Semibold (600), Bold (700).
### Line Height
- Tight: 1.2 (headings)
- Normal: 1.5 (body text)
- Relaxed: 1.75 (long-form reading)
### Letter Spacing
- Tight: -0.02em (large headings)
- Normal: 0 (body)
- Wide: 0.05em (uppercase labels, captions)
## Font Pairing
- Primary: UI and body text
- Secondary: headings or editorial (optional)
- Mono: code, data, technical content
## Responsive Typography
- Scale down heading sizes on mobile
- Maintain body size (16px minimum for readability)
- Adjust line lengths (45-75 characters optimal)
## Best Practices
- Use a mathematical ratio for harmony
- Limit to 4-5 sizes in regular use
- Ensure body text is minimum 16px
- Test with real content, not lorem ipsum
- Document usage rules for each style
