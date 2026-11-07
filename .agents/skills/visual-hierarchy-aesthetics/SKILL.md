---
name: visual-hierarchy-aesthetics
description: "Visual hierarchy principles, aesthetic-usability effect, Von Restorff isolation effect, platform conventions (macOS/iOS/Web), and data visualization aesthetics. Use when composing interfaces, establishing visual priority, or designing dashboards."
---

# Visual Hierarchy, Aesthetics & Cognitive Perception

## Visual Hierarchy

# Visual Hierarchy
You are an expert in creating clear visual hierarchy that guides users through interfaces.
## What You Do
You establish visual hierarchy ensuring users see the most important content first and can scan efficiently.
## Hierarchy Tools
### Size
Larger elements draw attention first. Use size differences of at least 1.5x for clear distinction.
### Weight
Bold text, thicker strokes, and filled icons carry more visual weight than light variants.
### Color and Contrast
High contrast attracts attention. Use color strategically for CTAs, status, and emphasis.
### Spacing
More whitespace around an element increases its perceived importance.
### Position
Top-left (in LTR layouts) gets seen first. Above the fold matters. F-pattern and Z-pattern scanning.
### Density
Isolated elements stand out. Grouped elements are scanned as a unit.
## Hierarchy Levels
1. **Primary**: Page title, primary CTA — seen first
2. **Secondary**: Section headings, key content — scanned next
3. **Tertiary**: Supporting text, metadata — read on demand
4. **Quaternary**: Fine print, timestamps — available but not prominent
## Common Patterns
- Hero sections: large type + image + single CTA
- Card layouts: image > title > description > action
- Forms: label > input > helper text > error
- Navigation: current state > available > disabled
## Best Practices
- Squint test: blur your eyes — hierarchy should still be clear
- One primary action per view
- Don't compete for attention — choose what matters most
- Use hierarchy to tell a story through the page
- Test with real users doing real tasks

---

## Aesthetic Usability

# Aesthetic-Usability Effect
You are an expert in the relationship between visual quality and perceived usability.
## What You Do
You apply the Aesthetic-Usability Effect to ensure visual consistency and polish translate into user trust and perceived quality — without masking genuine usability problems.
## The Principle
Users perceive aesthetically pleasing interfaces as easier to use, even before interacting with them. This is not about decoration — it is about **consistency as a signal of quality**:
- Consistent spacing, alignment, and type scale signals that the product is well-considered
- Visual noise or inconsistency makes users doubt the reliability of the system
- A polished surface creates tolerance: users forgive minor friction in beautiful UIs more readily
## Where It Applies
- **First impressions**: onboarding, landing pages, empty states — users form opinions before first interaction
- **Error states**: a well-designed error screen reads as trustworthy; a rough one reads as broken
- **Trust-critical contexts**: payment flows, health data, legal content — aesthetics directly affect willingness to proceed
- **Design systems**: consistent component usage signals quality across the entire product
## The Risk
The effect can mask usability problems. A beautiful interface that is hard to use will eventually frustrate users — aesthetic tolerance has limits. Use it to lower the bar for first impressions, not to substitute for sound information architecture or interaction design.
## Applying It
1. Establish and enforce a consistent spacing and type scale — irregularity reads as carelessness
2. Align to grid; misaligned elements signal low craft even if functional
3. Maintain visual weight consistency across similar actions (buttons, links, icons)
4. Design error, empty, and loading states with the same care as primary flows
5. Audit for visual inconsistency before launch — a single rough screen can lower the perceived quality of surrounding screens
## Best Practices
- Consistency is the most reliable aesthetic signal — prioritize it over novelty
- Test perceived quality with users who haven't seen the design before
- Don't confuse visual complexity with quality; restrained, deliberate design reads as more polished
- Pair aesthetic investment with usability testing — polish should not substitute for structural clarity

---

## Von Restorff Effect

# Von Restorff Effect
You are an expert in visual differentiation and its effect on memory and attention.
## What You Do
You apply the Von Restorff Effect (also called the Isolation Effect) to ensure the one element that most needs attention is visually distinct — and that distinctiveness is earned, not scattered.
## The Principle
An item that differs from its surroundings is more likely to be **noticed and remembered**. Visual homogeneity is the baseline; deviation draws the eye. This is why:
- A single filled button in a row of ghost buttons captures attention
- A highlighted row in a table reads as the most important item
- A price, CTA, or warning stands out when surrounded by lower-contrast elements
## Key Distinction
The effect depends on **contrast with context**. If everything is differentiated, nothing is. The principle only works when:
- One (or very few) items deviate
- Surrounding items are visually consistent with each other
- The deviation is meaningful, not decorative
## Applications
| Context | How to Apply |
|---|---|
| Call to action | One filled/primary button; all others ghost or text |
| Pricing | Highlight one recommended tier; reduce visual weight of others |
| Navigation | Active state distinctly different from inactive |
| Data tables | Use row highlight or bold type for the key record |
| Notifications | Badge or accent color reserved for actionable items only |
| Onboarding | One step or card at a time, visually isolated from upcoming steps |
## What to Avoid
- Applying the effect to multiple competing elements (defeats the purpose)
- Using it decoratively — random pops of color train users to ignore them
- Relying solely on color — pair with shape, size, or weight for accessibility
## Best Practices
- Decide in advance what the single most important element per screen or section is
- Audit for "isolation inflation" — every new feature requesting highlight treatment degrades the system
- Ensure the differentiated element is distinct on all states: hover, focus, disabled
- Test with colorblindness simulation; differentiation should survive grayscale

---

## Illustration Style

# Illustration Style
You are an expert in defining illustration systems that support product communication and brand identity.
## What You Do
You create illustration style guides ensuring consistent visual storytelling across a product.
## Style Definition
- **Geometric vs organic**: Angular/structured or flowing/natural
- **Flat vs dimensional**: 2D flat, 2.5D isometric, or 3D
- **Detailed vs minimal**: Level of detail and complexity
- **Abstract vs representational**: Symbolic or realistic
- **Line style**: Stroke weight, corners, endpoints
## Color in Illustration
- Use a subset of the product color palette
- Define primary, secondary, and accent illustration colors
- Rules for gradients and shadows
- Dark mode illustration variants
## Character Design (if applicable)
- Proportions and body style
- Level of detail in faces
- Diversity and representation guidelines
- Poses and expressions library
## Illustration Types
- **Spot illustrations**: Small, inline, supporting UI elements
- **Hero illustrations**: Large, featured, storytelling
- **Empty states**: Guide users when no content exists
- **Onboarding**: Explain features and concepts
- **Error states**: Soften error messages
## Application Rules
- When to use vs when not to use illustrations
- Size constraints per context
- Alignment with grid system
- Animation guidelines for illustrated elements
## Best Practices
- Keep a consistent style across all illustrations
- Create reusable element libraries
- Document the creation process for contributors
- Test at intended display sizes
- Consider accessibility (don't convey info only through illustrations)

---

## Platform Conventions

# Platform Conventions

You are an expert in iOS Human Interface Guidelines and Material Design, and in the trade-offs between platform-native and cross-platform product design.

## What You Do

You identify which UI patterns are platform-mandated conventions, map the meaningful differences between iOS and Android, and help teams decide when to follow each platform vs. when a unified cross-platform design is appropriate.

## Why Platform Conventions Matter

Users spend the vast majority of their time in the OS and its native apps. They build strong muscle memory for navigation, controls, and interaction patterns. When your product departs from platform convention without clear reason, users spend cognitive budget understanding your product rather than using it.

## Key Differences: iOS (HIG) vs. Android (Material Design 3)

### Navigation

| Pattern | iOS | Android |
|---|---|---|
| Back navigation | Swipe right from left edge; back button top-left | System back gesture (swipe from either edge) or predictive back; back arrow in app bar |
| Primary structure | Tab bar at bottom; sidebar on iPad | Navigation bar at bottom or Navigation drawer (hamburger) |
| Navigation history | Stack-based; each tab has its own stack | Single back stack across the app; tabs do not maintain independent history by default |
| Bottom navigation | Up to 5 tabs; no labels required | 3–5 tabs; labels required |

**Design implication**: iOS users expect swiping from the left edge to always go back; reserve that gesture zone. On Android, the system back gesture handles this — in-app swipe-from-left can be used for a drawer without conflicting.

### Controls and Components

| Component | iOS convention | Android (Material 3) convention |
|---|---|---|
| Toggle switch | UISwitch — pill shape, right-aligned in lists | Switch — thumb-and-track, can appear inline or in lists |
| Destructive confirmation | Action sheet (bottom) with red destructive option | Dialog with text buttons; red/error tone for destructive |
| Date/time picker | Wheel picker or calendar inline | Calendar with text input alternative |
| Selection menus | Picker wheel or action sheet | Exposed dropdown or modal bottom sheet |
| Primary button | Filled rectangle, full-width in forms | Filled button (rounded corners by default in M3) |
| Floating action | Not a convention — use contextual buttons | FAB — primary surface action, bottom-right |
| Pull to refresh | Native UIRefreshControl | SwipeRefreshLayout — same gesture, different visual |

### Typography

| Attribute | iOS | Android |
|---|---|---|
| System font | SF Pro (text) / SF Compact (watch) | Roboto / Google Sans |
| Dynamic type | Required — users control text size system-wide | Scalable pixels (sp) — must respect system font scale |
| Type scale | iOS text styles (Large Title, Title 1–3, Body, etc.) | Material type scale (Display, Headline, Title, Body, Label) |

Both platforms require apps to respect the user's system font size preference. Hardcoded point sizes that do not scale are an accessibility failure on both.

### Interaction and Gesture Conventions

| Gesture | iOS behaviour | Android behaviour |
|---|---|---|
| Swipe to delete | Standard in table views | Swipe to dismiss/archive (context-dependent) |
| Long press | Peek / context menu (iOS 13+ context menus) | Contextual action mode; long press to select |
| Pull to refresh | Standard | Standard |
| Pinch to zoom | Standard in maps, images | Standard |
| Back swipe | Reserved — always navigates back | Predictive back gesture; apps can opt in to preview |

### Visual and Iconography

| Area | iOS | Android |
|---|---|---|
| Icon library | SF Symbols (thousands, variable weight, auto-scale) | Material Symbols (rounded, outlined, sharp variants) |
| Corner radius | Larger, "squircle" curves (superellipse) | Moderate — Material 3 uses prominent rounding on components |
| System colours | Dynamic colors that adapt to dark/light automatically | Material You dynamic color — generated from wallpaper |
| Modal presentation | Sheet that slides up from bottom, with grab handle | Bottom sheet (standard or modal) or full-screen dialog |

## Cross-Platform Design Decisions

### When to follow each platform strictly
- Native or near-native apps where platform fluency is a key quality signal (banking, health, utility apps)
- Apps that integrate deeply with OS features (share sheet, widgets, Siri/Google Assistant)
- Apps with a large base of platform-experienced power users

### When a unified design is appropriate
- Products with high feature parity across platforms where design consistency reduces maintenance cost
- Products where cross-device continuity matters (e.g. users switch between iPhone and Android or web)
- B2B tools where users interact primarily with the product's own design system, not OS affordances

### The hybrid approach
Most cross-platform products adopt a middle path: a unified visual and component language, but with platform-specific adaptations for navigation (system-level conventions), system controls, and gesture conflicts. The product looks like itself; it behaves like the OS.

## What Not to Do

- Do not use a bottom tab bar on Android if it uses the gesture navigation that conflicts with a swipe-up action
- Do not suppress the iOS swipe-back gesture — users who trigger it and nothing happens will be confused and trust drops
- Do not use iOS action sheets on Android or Android dialogs on iOS as primary decision patterns
- Do not ignore Dynamic Type / SP scaling on either platform — fixed text sizes are an accessibility failure
- Do not transplant the FAB pattern to iOS without justification — it has no native precedent there

## Best Practices

- Read the current platform guidelines before each major design phase; both iOS HIG and Material 3 update frequently
- Audit native apps on each platform for the interaction you are designing before proposing a solution
- Maintain a component mapping document: what the design system calls a thing, what iOS calls it, what Android calls it
- Test on real devices for each platform — simulator behaviour and gesture handling differ from physical devices
- When in doubt about a platform-specific pattern, use what ships in the OS: it is already tested, already familiar

---

## Data Visualization

# Data Visualization
You are an expert in designing clear, accessible, and informative data visualizations.
## What You Do
You design data visualizations that communicate insights effectively using appropriate chart types and styling.
## Chart Selection
### Comparison
Bar charts (categorical), grouped bars (multi-series), bullet charts (target vs actual).
### Trend Over Time
Line charts (continuous), area charts (volume), sparklines (inline).
### Part of Whole
Pie/donut (few categories), stacked bar (many categories), treemap (hierarchical).
### Distribution
Histogram, box plot, scatter plot.
### Relationship
Scatter plot, bubble chart, heat map.
## Design Principles
- Data-ink ratio: maximize data, minimize decoration
- Clear axis labels and legends
- Consistent color encoding across views
- Start y-axis at zero for bar charts
- Use annotation to highlight key insights
## Color in Data Viz
- Sequential: light to dark for ordered data
- Diverging: two-hue scale for above/below midpoint
- Categorical: distinct hues for unrelated categories
- Colorblind-safe palettes (avoid red-green only)
## Accessibility
- Don't rely on color alone — use patterns, labels, or shapes
- Provide text alternatives for charts
- Keyboard navigable interactive charts
- Sufficient contrast for data elements
## Responsive Data Viz
- Simplify at small sizes (fewer data points, larger labels)
- Consider alternative views for mobile (table instead of chart)
- Touch-friendly tooltips and interactions
## Best Practices
- Choose the simplest chart that communicates the insight
- Label directly on the chart when possible (avoid legends)
- Provide context (benchmarks, targets, trends)
- Test with real data, not idealized samples
- Allow users to explore details on demand
