---
name: gestalt-design-principles
description: "Master guide to Gestalt visual perception laws in UI/UX: Proximity, Similarity, Closure, Common Region, Continuity, and Figure-Ground. Use when designing layouts, establishing component grouping without heavy borders, aligning user focus, and minimizing cognitive load."
---

# Gestalt Design Principles for UI/UX (Master Guide)

## Law Of Proximity

# Law of Proximity
You are an expert in Gestalt visual organization and spatial grouping.
## What You Do
You apply the Law of Proximity to create clear visual groupings through spacing — so users understand relationships between elements without labels or borders.
## The Principle
Elements that are close together are perceived as belonging to a group. Whitespace creates separation; tightness implies relationship. This is the most fundamental layout grouping tool:
- A label and its input field, close together → perceived as a pair
- A heading and the content below it, closer to each other than to the preceding section → heading reads as belonging to that content
- Action buttons grouped near the content they act on → clearly scoped to that content
## How It Works in Layouts
- **Between groups**: use more space to signal separation
- **Within groups**: use less space to signal belonging
- The ratio of within-group spacing to between-group spacing is what creates the hierarchy — there is no fixed pixel value
- Consistent application of the same spacing increments makes proximity relationships legible at a glance
## Common Applications
| Pattern | Proximity Rule |
|---|---|
| Form fields | Label tighter to its input than to the next field |
| Card content | Title, body, and metadata tighter together; card separated from adjacent cards |
| Section headers | Less space below header (to its content) than above it (from previous section) |
| Button groups | Related actions tight; destructive action separated |
| Data rows | Row padding tighter than row gap |
| Icon + label | Icon and label tight; pairs separated from each other |
## Relationship to Other Principles
- **Law of Common Region**: proximity and containment reinforce each other; use one or the other, not always both
- **Visual hierarchy**: proximity communicates structure before color or type weight
- **Gestalt similarity**: items that look alike and are close together form the strongest groupings
## Best Practices
- Define spacing using a consistent scale (4px, 8px, 16px, 24px, 32px…) so proximity relationships are systematic
- Never rely on a border to do the work that spacing can do
- Check proximity groupings by squinting at the layout — groups should be legible without reading content
- Audit pages where users misread the structure first; proximity is usually the cause

---

## Law Of Similarity

# Law of Similarity

You are an expert in Gestalt visual perception and systematic visual language design.

## What You Do

You apply the Law of Similarity to use shared visual attributes — shape, color, size, and style — to signal that elements belong to the same category or group, and to maintain that coding consistently so the signal stays meaningful.

## The Principle

Elements that share visual characteristics are perceived as related, even when they are not spatially adjacent. The mind groups by likeness automatically and without instruction.

Similarity can be carried through:
- **Color**: same fill signals same category, role, or state
- **Shape**: icons all the same style (outline vs. filled vs. rounded) read as a set
- **Size**: elements of equal size read as peers; size difference signals hierarchy
- **Style**: same illustration weight, same type treatment, same corner radius, same stroke width

## Similarity vs. Proximity

These are the two most fundamental Gestalt grouping principles. They interact and can conflict:

| Situation | What happens |
|---|---|
| Elements close together, same color | Both reinforce — strongest grouping signal |
| Elements far apart, same color | Similarity groups them despite the distance |
| Elements close together, different colors | Proximity and similarity compete; the color pulls them into different sub-groups |
| Elements close together, different styles | Proximity groups the set; style difference creates sub-groups within it |

When they conflict, similarity can override proximity: a red element embedded in a group of blue elements reads as distinct even if it is spatially adjacent. Use this deliberately to signal category boundaries.

## Design Applications

### Interactive state signaling

All interactive elements should share a visual property (color, underline treatment, cursor affordance) that non-interactive elements do not. This tells users what is actionable without requiring explicit instruction — the similarity set defines the interactive category.

### Category and role coding

- Navigation items as a set: consistent type treatment across all items
- Destructive actions: a distinctive color used only within that category — similarity within the set signals "these all carry the same risk"
- Status indicators: consistent color-to-meaning mapping (green = success, amber = warning, red = error) applied uniformly

When any element deviates from an established similarity set without purpose, users read the deviation as meaningful — as if the deviant element belongs to a different category.

### Design systems and component coherence

Similarity is the mechanism that makes a design system feel like one thing rather than a collection of unrelated components:
- Same button shape across all button variants
- Same input height and border treatment across all form elements
- Same icon stroke weight and style across all icons

Unintended similarity breaks — two buttons with slightly different corner radii that are supposed to be the same type — read as categorical differences. Treat them as bugs.

### Data visualisation

- Same color = same data series across all charts in a report
- Same mark shape = same variable across chart types
- Grouping by similarity (color, shape) before spatial proximity is standard in multi-series visualisations

## Common Mistakes

- Breaking similarity unintentionally: slight visual inconsistencies in what should be a uniform set signal a difference the designer did not intend
- Overusing a single attribute: coding too many distinct categories with the same color makes the attribute meaningless as a signal
- Relying on color similarity alone: colorblind users cannot distinguish groups encoded only through hue — always use redundant coding

## Best Practices

- Define a similarity vocabulary in design tokens: which visual attributes encode which relationship types
- Treat unintended visual differences as bugs — if two elements should read as the same type, they must look identical
- Use redundant coding (shape + color, not color alone) for critical category signals so the information survives colorblind viewing and monochrome rendering
- Test similarity groupings without color: do elements still read as related from shape and size alone?
- Review dense layouts for unintended sub-groupings created by similarity interacting with proximity

---

## Law Of Closure

# Law of Closure

You are an expert in visual perception and the cognitive patterns that let users interpret incomplete visual information as whole shapes.

## What You Do

You apply the Law of Closure to use implied rather than explicit boundaries, design icons from minimal cues, and create UI structure that the mind completes automatically — reducing visual weight while preserving perceptual clarity.

## The Principle

The mind prefers complete, familiar shapes. When presented with an incomplete form, it fills in the missing parts to perceive a whole. This is closure — we see the complete shape, not the gaps.

**Implication**: you do not need to draw every line to create a visual boundary. You need enough information for the mind to close the shape.

## Applications in UI Design

### Icons and symbols

Many standard icons rely on closure:
- A circle with a gap reads as a ring or progress indicator
- An incomplete checkbox border still reads as a square
- Bracket-style frames with open ends still read as contained groups
- A progress arc with a missing segment is still perceived as a circle measuring completion

Icons do not need to be fully enclosed to be recognised. Over-specifying all edges removes the visual elegance that makes refined icons feel lightweight. Closure is what allows icon sets to feel minimal without feeling broken.

### Implied containers and boundaries

Full borders add visual weight. Closure allows lighter alternatives that communicate the same grouping:
- **Single-edge dividers**: a horizontal rule above a section implies the section boundary without enclosing it
- **Corner accents**: placing a visual element only at corners implies a bounding rectangle between them
- **Fading backgrounds**: a section background that fades to transparent at the edge — the mind closes the container where the color ends
- **Partial rules**: a short divider on one side implies division without a full-width line

This is how modern UI surfaces feel open and uncluttered while still communicating structure.

### Grid and layout structure

A well-executed grid does not need explicit rules. Users perceive the columns through alignment:
- Consistently left-aligned elements imply a vertical grid line without drawing it
- Consistent vertical rhythm implies a horizontal grid
- The grid is felt as a structure, not drawn as one

Explicit grid lines are usually redundant and add visual noise; alignment creates the same perception through closure.

### Scroll and swipe affordances

An element partially visible at the edge of a screen implies that more content exists in that direction. The clipped edge creates closure — the mind completes the hidden object — which signals scrollability without an explicit indicator. This is standard practice in carousels, horizontal scroll lists, and off-canvas panels.

## Closure and Negative Space

Closure depends on negative space. The surrounding space provides the information the mind uses to infer shape boundaries. Designs with generous whitespace and clear negative space make closure easy; cluttered layouts prevent it by offering too many competing partial shapes.

The mind cannot close a shape it cannot isolate. Reduce surrounding noise before relying on closure.

## When to Use Explicit Boundaries Instead

Closure is appropriate when the boundary is supplementary — grouping that reinforces other signals. Use explicit closure (a full border or filled background) when:
- The container boundary is the primary grouping signal, not supplementary
- The element is interactive and the boundary defines its hit area
- The design will render in contexts where whitespace or spacing may collapse (email, dense data tables)

## Best Practices

- Remove borders iteratively: check whether the boundary is still perceived without them — if it is, the border is redundant
- Use corner accents or single-edge rules as a first step before adding a full enclosing border
- Test icons at small sizes (16px, 20px): does the shape still close? If not, the icon may need more visual information at that scale
- Pair closure with proximity or similarity to reinforce the mind's ability to complete an ambiguous shape
- In dark mode, re-validate closure: negative space relationships shift when background values change, and a closed shape in light mode may feel open in dark

---

## Law Of Common Region

# Law of Common Region
You are an expert in Gestalt visual organization and containment-based grouping.
## What You Do
You apply the Law of Common Region to create clear groupings using visual boundaries — backgrounds, borders, cards, and surfaces — so users understand which elements belong together.
## The Principle
Elements enclosed within a shared boundary or placed on a shared background are perceived as a group, even when they are not especially close together. Containment is one of the strongest grouping signals available:
- A card with a background creates an unambiguous group
- A colored section background ties disparate content into a unit
- A panel border tells users that everything inside belongs together
## Common Region vs Proximity
Both signal grouping; they work differently:
| | Law of Proximity | Law of Common Region |
|---|---|---|
| Mechanism | Spatial closeness | Shared boundary or background |
| Best for | Related items already close | Items that need a stronger or explicit boundary |
| Overhead | Zero — just spacing | Visual weight — a border or background is present |
| When to prefer | Most layout grouping | Cards, panels, sidebars, tabbed sections, modals |
Use proximity first; add common region when proximity alone is insufficient or when the grouping boundary needs to be explicit (e.g. a card that can be acted on as a unit, a form section within a larger form).
## Applications
| Pattern | Common Region Role |
|---|---|
| Cards | Container clearly delimits a discrete item |
| Sidebar | Background or border separates navigation from content |
| Modal / sheet | Surface elevation signals an isolated task context |
| Form sections | Background or rule divides logical groups within a long form |
| Table rows | Hover/selection background shows a row as a unit |
| Tag groups | Pill background makes each tag a discrete object |
| Tooltip | Container boundary distinguishes overlay from page content |
## When Containment Is Counterproductive
- Using cards for everything flattens hierarchy — not every group needs a container
- Nested common regions create visual noise; limit nesting depth to two levels
- A border for its own sake adds clutter; if proximity already communicates the grouping, the border is redundant
## Best Practices
- Give containers consistent corner radius, padding, and shadow within a design system
- Use the weakest container that gets the job done — background before border, border before card surface
- Ensure common regions survive in low-contrast or dark mode contexts
- Don't combine proximity and common region redundantly on the same grouping unless you are establishing hierarchy (a card inside a panel section, for example)

---

## Law Of Continuity

# Law of Continuity

You are an expert in visual flow, eye movement, and directional design.

## What You Do

You apply the Law of Continuity to design layouts and UI elements that guide the eye along deliberate paths, establish visual flow through sequences, and use interrupted continuity to signal transitions between groups.

## The Principle

The mind prefers smooth, continuous paths over abrupt changes in direction. When elements are arranged along a line or curve — even an implied one — they are perceived as belonging together, and the eye follows the path naturally.

Elements that continue a smooth trajectory are perceived as related; elements that interrupt it are perceived as distinct or beginning something new.

## Applications

### Alignment and reading flow

The most fundamental application of continuity is alignment:
- Left-aligned text and elements create a continuous vertical edge the eye follows top to bottom
- Consistently aligned items in a column imply a vertical axis that organises the reading path
- Disrupting alignment — even by a few pixels — interrupts the eye's path and signals a boundary or an error

In a form, every input aligned on the same left edge creates a continuous reading path. Misalignment forces the eye to reorient at each field, adding friction to every step.

### Directional indicators

Arrows and chevrons extend the trajectory the eye is already following:
- A carousel arrow points in the direction of the next content — the eye follows the arrow to the implied continuation
- A "show more" chevron at the end of a truncated list extends the reading path into the expanded state
- Step indicators connected by lines create an explicit path through a process

The arrow does not add information; it makes continuous flow explicit where it might otherwise be ambiguous.

### Timelines and sequenced content

Timeline components rely entirely on continuity. The connecting line implies that items belong to a single sequence and establishes directional order. Without the line, the same items read as an unordered list. The line creates sequence from spatial arrangement.

### Scroll and swipe affordances

Implied directional paths signal interaction:
- A scroll handle on a track implies a continuous vertical path of content
- Dot indicators below a carousel imply a horizontal sequence of slides — the dots are the path made visible
- A pull-to-refresh animation follows an implied vertical path that extends beyond the screen edge

The affordance works through continuity: the eye reads the implied path and the hand follows it.

### Using interrupted continuity to separate groups

Just as continuity groups, interrupted continuity separates. A deliberate break in an otherwise continuous path signals a transition:
- A larger gap in a list signals a new section (even without a heading)
- A divider line interrupts a vertical reading path to announce a category boundary
- Indentation redirects the eye along a secondary path, signalling sub-hierarchy within the main flow

## Continuity and Visual Hierarchy

Continuity interacts with hierarchy:
- A continuous left-aligned reading path implies equal-weight items
- Breaking from the alignment for specific items — indenting, offsetting, or stepping right — signals sub-hierarchy without typography

Indented content is not just spatially different; it is on a different continuous axis, which is what makes the hierarchy legible.

## Best Practices

- Establish reading paths deliberately before placing elements: where should the eye enter, how should it travel, and where should it land?
- Audit alignment at every breakpoint — single-pixel misalignments interrupt perceived continuity even when they are below conscious notice
- Use connecting lines, arrows, and dot indicators to make implied paths explicit in complex layouts
- Test flow by asking users to describe how they read through a screen; interrupted continuity appears as confusion or backtracking
- Remove elements that interrupt the intended path without contributing meaning — they impose reorientation cost without value

---

## Law Of Figure Ground

# Law of Figure-Ground

You are an expert in visual attention and the perceptual hierarchy of UI surfaces.

## What You Do

You apply the Law of Figure-Ground to ensure users can instantly identify what is foreground (the content or action) and what is background (the context or surface), and to control this relationship deliberately at every layer of the interface.

## The Principle

The mind automatically separates visual fields into a subject (the figure) and a context (the ground). Figure is perceived as being in front, bounded, and the focus of attention. Ground is perceived as behind, unbounded, and receding.

This parsing is not a choice — it is a perceptual reflex. Every UI surface triggers figure-ground separation. The question is whether you designed it deliberately or left it to chance.

## Characteristics of Figure vs. Ground

| Figure (foreground) | Ground (background) |
|---|---|
| Appears in front | Appears behind |
| Bounded — perceived as having edges | Unbounded — perceived as extending beyond the figure |
| Focus of attention | Context for attention |
| Higher contrast, richer texture or detail | Lower contrast, flatter, more uniform |
| Typically smaller area | Typically larger area |

## Establishing Clear Figure-Ground in UI

### Elevation and shadow

Elevation is the primary tool for figure-ground in layered design systems. A card elevated above a page surface is figure; the page is ground. The shadow signals depth, and depth signals foreground. Dropdowns, sheets, modals, and tooltips must appear above the surface they are called from — depth signals primacy.

### Overlays and scrims

A modal requires the background to recede. A scrim — a semi-transparent dark overlay — reduces the ground's visual presence so the modal can be unambiguous figure. Without a scrim, figure-ground is unclear and attention is split between the modal and the page beneath it.

### Contrast

High-contrast elements are perceived as figure; low-contrast elements as ground. Text on a surface works through figure-ground: the text is figure (high contrast, bounded by its line), the surface is ground (lower contrast, unbounded). When text and background share too similar a luminance value, figure-ground collapses and the text is no longer legible.

### Active and selected states

In navigation or lists, the selected item becomes figure; unselected items become ground. The selected state — a background fill, a bold type treatment, a color change — must make the figure-ground shift unambiguous. If the selected and unselected states are too similar, users cannot tell which item is active.

## Ambiguous Figure-Ground

Ambiguous figure-ground occurs when the same element can be read as either figure or ground — the visual equivalent of the Rubin vase. In fine art and illustration this is sometimes intentional. In UI, it is almost always a failure.

If users cannot immediately parse what is content and what is surface, they cannot act with confidence.

## Common Figure-Ground Failures

- **Insufficient scrim**: a modal on a white page without a scrim requires users to parse figure-ground from edges alone — always provide a background-dimming layer
- **Nested elevation without contrast**: cards inside cards without clear luminance difference between levels produce ambiguous depth
- **Text on photography**: the image competes as figure; separate text from images with a color overlay, blur, or gradient layer
- **Flat design without surface differentiation**: removing elevation signals entirely makes foreground/background relationships invisible — some depth signal is necessary

## Dark Mode Considerations

Light and dark modes invert the typical luminance relationship between figure and ground. What was dark figure on a light ground becomes light figure on a dark ground. Shadows that read as elevation in light mode may become invisible in dark mode — use subtle light-colored borders or reduced-luminance fills to maintain figure-ground clarity when shadows disappear.

## Best Practices

- Define your surface stack in design tokens: base, raised, overlay, modal — each level should have a clear and consistent contrast relationship to the layers below it
- Never place text directly on photography or complex imagery without a separation layer
- Test figure-ground by removing color: can you still identify foreground from background using only shape and contrast?
- Use elevation sparingly — the more surface layers you stack, the harder it becomes to maintain an unambiguous hierarchy
- Validate scrims in both themes: a scrim that works in light mode may need adjusting in dark mode where the base surface is already dark
