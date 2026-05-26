# Design System Inspired by SehatHub

## 1. Visual Theme & Atmosphere

SehatHub's design system embodies a healthcare-forward, trusted, and accessible aesthetic that prioritizes clarity and compassionate user interactions. The visual language combines vibrant accent colors with a calm, neutral foundation, creating an interface that feels both professional and approachable. The design emphasizes information hierarchy, accessibility, and intuitive navigation to support critical health and pharmacy decisions. Rounded corners and generous whitespace convey warmth and safety, while bold typography and strategic color usage guide users through complex medical product information with confidence.

**Key Characteristics**
- Clean, minimal aesthetic with healthcare trust signals
- Vibrant primary colors that command attention for critical actions
- Soft, calming secondary colors supporting medicinal contexts
- High contrast neutral typography for readability
- Generous spacing and breathing room throughout
- Rounded corners on interactive elements for approachability
- Icons paired with text for accessibility and clarity

## 2. Color Palette & Roles

### Primary
- **Brand Pink** (`#E0004D`): Primary call-to-action buttons, critical interactive elements, brand identity marker throughout the interface
- **Brand Red** (`#F44336`): Alternative primary action states, error conditions, and emphasis in validation

### Accent Colors
- **Cyan Accent** (`#75E5FF`): Highlight states, secondary UI elements, information badges, and decorative accents
- **Teal Brand** (`#4DB6C1`): Supporting accent for secondary interactions and informational containers
- **Light Mint** (`#A8DAB5`): Success states, positive information cards, and health-related confirmations

### Interactive
- **Soft Pink** (`#F399B8`): Hover states on secondary buttons, subtle interactive feedback
- **Deep Rose** (`#E94D82`): Active/pressed states on primary elements
- **Brown** (`#764711`): Informational callouts, cautionary text for medical guidance

### Neutral Scale
- **Dark Gray** (`#333333`): Primary text, headings, high-contrast body copy
- **Black** (`#000000`): Deep shadows, critical text, strong hierarchy emphasis
- **Light Gray** (`#E5E7EB`): Borders, dividers, subtle background separation, form field borders
- **Medium Gray** (`#424242`): Secondary text, deemphasized labels
- **Softer Gray** (`#666666`): Tertiary text, helper text, footnotes
- **Light Border Gray** (`#D9D9D9`): Soft dividers, card separators
- **Off-White** (`#FAFAFA`): Subtle background tint, alternate surface color

### Surface & Borders
- **White** (`#FFFFFF`): Primary surface background, card backgrounds, main content areas
- **Off-White** (`#FAFAFA`): Alternate surface for hierarchy, soft backgrounds
- **Border Light** (`#E5E7EB`): Standard borders, dividers, card outlines

### Semantic / Status
- **Error Red** (`#E0004D`): Error states, validation failures, critical warnings
- **Error Alt Red** (`#F44336`): Secondary error messaging, form validation
- **Error Deep** (`#E0340B`): Severe error states, critical medical contraindications
- **Success Mint** (`#A8DAB5`): Success confirmations, approved information

## 3. Typography Rules

### Font Family
**Primary:** Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

**Secondary:** Inter, system-ui, sans-serif

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / H1 | Inter | 26px | 700 | 36.4px | 0px | Page titles, product names |
| Heading / H2 | Inter | 18px | 700 | 25.2px | 0px | Section headers, card titles |
| Subheading / H3 | Inter | 14px | 600 | 20px | 0px | Subsection titles, tab labels |
| Body / Paragraph | Inter | 12px | 500 | 16px | 0px | Body text, descriptions, product details |
| Body Large | Inter | 16px | 400 | 24px | 0px | Extended body copy, information sections |
| Button / Label | Inter | 16px | 700 | 24px | 0px | Button text, interactive elements |
| Label / Caption | Inter | 14px | 700 | 16.1px | 0px | Form labels, field labels |
| Caption / Small | Inter | 12px | 400 | 16px | 0px | Helper text, footnotes, secondary labels |

### Principles
- Maintain strong visual hierarchy through weight and size differentiation
- Use 700-weight for all interactive and heading text to establish clarity
- Default body copy at 12px for density in product listings; increase to 16px for narrative content
- All caps should never be used; title case preferred for accessibility
- Line height increases proportionally with size to maintain readability
- Pair larger sizes with lighter weights for extended reading

## 4. Component Stylings

### Buttons

**Primary Button (Large)**
- Background: `#E0004D`
- Text Color: `#FFFFFF`
- Font Size: `16px`
- Font Weight: `700`
- Padding: `8px 16px`
- Border Radius: `4px`
- Border: `0px none`
- Height: `40px`
- Line Height: `24px`
- Box Shadow: `none`
- Hover State: Background `#E94D82`, scale 1.02
- Active State: Background `#C70040`

**Primary Button (Medium)**
- Background: `#E0004D`
- Text Color: `#FFFFFF`
- Font Size: `16px`
- Font Weight: `700`
- Padding: `0px 12px`
- Border Radius: `4px`
- Border: `0px none`
- Height: `48px`
- Width: `106px`
- Line Height: `18.4px`
- Box Shadow: `none`
- Hover State: Background `#E94D82`

**Primary Button (Small)**
- Background: `#E0004D`
- Text Color: `#FFFFFF`
- Font Size: `14px`
- Font Weight: `700`
- Padding: `0px 8px`
- Border Radius: `4px`
- Border: `0px none`
- Height: `32px`
- Line Height: `16.1px`
- Box Shadow: `none`
- Hover State: Background `#C70040`

**Secondary Button (Ghost)**
- Background: `rgba(0, 0, 0, 0)`
- Text Color: `rgba(0, 0, 0, 0.7)`
- Font Size: `16px`
- Font Weight: `700`
- Padding: `4px 4px`
- Border Radius: `0px`
- Border: `0px solid`
- Box Shadow: `none`
- Hover State: Text Color `#333333`, underline `1px solid #333333`

**Navigation Button (Unstyled)**
- Background: `rgba(0, 0, 0, 0)`
- Text Color: `#000000`
- Font Size: `16px`
- Font Weight: `400`
- Padding: `12px 8px`
- Border Radius: `0px`
- Border: `0px solid #E5E7EB`
- Height: `144px`
- Line Height: `24px`
- Hover State: Background `#FAFAFA`

### Cards & Containers

**Info Card (Mint Success)**
- Background: `#E6F3EF`
- Text Color: `#045136`
- Font Size: `16px`
- Font Weight: `400`
- Padding: `4px 12px`
- Border Radius: `8px`
- Border: `1px solid #045136`
- Height: auto, min `384px`
- Line Height: `24px`
- Box Shadow: `none`
- Use Case: Description & benefits, medical information callouts

**Basic Card**
- Background: `#FFFFFF`
- Text Color: `#000000`
- Font Size: `16px`
- Font Weight: `400`
- Padding: `0px 0px`
- Border Radius: `0px`
- Border: `0px solid #E5E7EB`
- Box Shadow: `none`
- Use Case: Product tiles, general content containers

**Elevated Card**
- Background: `#FFFFFF`
- Text Color: `#000000`
- Padding: `16px 16px`
- Border Radius: `8px`
- Border: `1px solid #E5E7EB`
- Box Shadow: `0px 2px 8px rgba(0, 0, 0, 0.08)`
- Hover State: Box Shadow `0px 4px 12px rgba(0, 0, 0, 0.12)`

### Inputs & Forms

**Text Input (Default)**
- Background: `#FFFFFF`
- Text Color: `#333333`
- Border: `1px solid #E5E7EB`
- Border Radius: `4px`
- Padding: `8px 12px`
- Font Size: `14px`
- Height: `40px`
- Line Height: `20px`
- Placeholder Color: `#999999` at 70% opacity
- Focus State: Border Color `#E0004D`, Box Shadow `0px 0px 0px 3px rgba(224, 0, 77, 0.1)`

**Text Input (Error)**
- Background: `#FFFFFF`
- Border: `1px solid #E0004D`
- Text Color: `#333333`
- Focus State: Border Color `#E0004D`, Box Shadow `0px 0px 0px 3px rgba(224, 0, 77, 0.15)`

**Label**
- Font Size: `14px`
- Font Weight: `700`
- Color: `#333333`
- Line Height: `16.1px`
- Margin Bottom: `4px`

### Navigation

**Horizontal Navigation Bar**
- Background: `#FFFFFF`
- Text Color: `#000000`
- Font Size: `16px`
- Font Weight: `400`
- Padding: `16px 0px`
- Border: `0px solid #E5E7EB`
- Height: `148px`
- Line Height: `24px`
- Active State: Text Color `#E0004D`, bottom border `2px solid #E0004D`
- Hover State: Text Color `#333333`

**Breadcrumb Link**
- Font Size: `14px`
- Font Weight: `600`
- Color: `#333333`
- Line Height: `20px`
- Text Decoration: none
- Hover State: Color `#E0004D`, cursor pointer

**Standalone Link**
- Font Size: `16px`
- Font Weight: `400`
- Color: `#000000`
- Line Height: `24px`
- Text Decoration: none
- Hover State: Text Decoration `underline`, Color `#E0004D`

## 5. Layout Principles

### Spacing System
**Base Unit:** `4px`

**Scale:**
- `4px`: Tight spacing on button padding, small gaps between adjacent inline elements
- `8px`: Small padding on inputs, gap between form labels and fields
- `12px`: Standard padding on cards, gap between list items
- `16px`: Card padding, button padding (large), section padding
- `20px`: Gap between major sections, spacing in grids
- `24px`: Margin between section blocks, distance between card groups
- `32px`: Large margin between major content areas
- `40px`: Padding on main content containers
- `48px`: Large spacing between full-width sections
- `52px`: Bottom margin for primary content blocks
- `72px`: Page-level vertical padding
- `100px`: Maximum gap between disparate page sections

### Grid & Container
- **Max Container Width:** `1408px`
- **Column Strategy:** 12-column responsive grid for desktop, collapsing to single column on mobile
- **Gutter Width:** `16px` between columns
- **Section Pattern:** Full-width colored sections with centered content container at 1408px max-width
- **Padding:** `40px` left/right on desktop, `16px` on tablet, `12px` on mobile

### Whitespace Philosophy
SehatHub prioritizes breathing room throughout. Critical actions and information blocks are separated by at least `24px` of vertical space. Horizontal spacing uses the `20px` unit for balanced visual rhythm. Generous whitespace around form inputs improves scannability and reduces cognitive load in health-related decision-making.

### Border Radius Scale
- `0px`: Navigation items, body text, basic cards (flat design)
- `4px`: Buttons, text inputs, small UI elements (sharp but friendly)
- `8px`: Elevated cards, information panels, modal containers (moderate rounding)
- `12px`: Large modal dialogs, full-width info sections (soft, approachable)

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | No shadow, `0px 0px 0px 0px` | Navigation, body text, basic cards |
| Subtle | `0px 2px 8px rgba(0, 0, 0, 0.08)` | Elevated cards, form containers, secondary surfaces |
| Medium | `0px 4px 12px rgba(0, 0, 0, 0.12)` | Card hover states, dropdown menus, modal backdrops |
| Prominent | `0px 8px 24px rgba(0, 0, 0, 0.15)` | Modal dialogs, primary action panels, floating elements |

**Shadow Philosophy:** SehatHub employs subtle, minimal shadows to create gentle depth separation without visual heaviness. Shadows are used sparingly to distinguish interactive surfaces from background content and to establish visual hierarchy in complex layouts. All shadows use low opacity dark colors (`rgba(0, 0, 0, 0.08–0.15)`) to maintain the light, approachable aesthetic. Hover states increase shadow depth by one level to signal interactivity.

## 7. Do's and Don'ts

### Do
- Use `#E0004D` (Brand Pink) exclusively for primary call-to-action buttons that drive critical actions (purchase, confirm, book appointment)
- Apply `#A8DAB5` (Light Mint) backgrounds with border for all success states and positive health confirmations
- Pair heading text at `18–26px` with `700` font weight for immediate visual hierarchy
- Space form fields vertically with `16px` padding minimum between label and input
- Apply `8px` border radius to all interactive input elements for consistency
- Use `#333333` (Dark Gray) for all body text; ensure minimum 12px size for readability
- Include icon + text combinations in all buttons for accessibility; icons should be `16–24px`
- Limit color palette to 6–8 primary hues per page to maintain visual clarity
- Apply `4px` border radius to buttons for a professional, subtle softness
- Use breadcrumb navigation with `>` separator and `#333333` color for wayfinding

### Don't
- Never use colors outside the defined palette for UI elements (e.g., random greens, blues, or purples)
- Don't apply borders to buttons unless explicitly a ghost/tertiary variant
- Don't mix font sizes within a single text block; use the hierarchy table exclusively
- Never center-align body text; use left-align (or right-align in RTL contexts)
- Don't apply text-transform to any typography; manually use title case or all-caps only in rare design callouts
- Don't use box shadows exceeding `0px 8px 24px rgba(0, 0, 0, 0.15)` on any element
- Never stack more than 3 levels of heading hierarchy on a single page
- Don't use `#FFFFFF` or `#000000` as primary text on colored backgrounds; use high-contrast approved colors
- Don't apply border radius exceeding `12px` on any component unless designing a pill-shaped badge
- Never use hover states that reduce contrast; always increase legibility on interaction

## 8. Responsive Behavior

### Breakpoints

| Breakpoint Name | Width | Key Changes |
|-----------------|-------|-------------|
| Mobile | `320px–599px` | Single-column layout, `12px` padding, `14px` body text, full-width buttons, collapsed navigation |
| Tablet | `600px–999px` | Two-column grid, `16px` padding, `14px` body text, stacked form layouts, horizontal navigation with wrapping |
| Desktop | `1000px–1408px` | 12-column grid, `40px` padding, `16px` body text, full-width forms, fixed horizontal navigation |
| Large Desktop | `1409px+` | Max-width container at `1408px`, centered layout, full feature set |

### Touch Targets
- **Minimum Interactive Size:** `40px × 40px` (buttons, links, form inputs)
- **Comfortable Spacing:** `12px` minimum between touch targets on mobile
- **Button Padding:** `8px` vertical, `12px` horizontal minimum for touch screens
- **Icon Size:** `20–24px` for touch interfaces; `16px` for desktop only
- **Form Field Height:** `40px` minimum on mobile, `48px` preferred for accessibility

### Collapsing Strategy
- **Navigation:** Horizontal on desktop/tablet; collapse to hamburger menu below `600px` with off-canvas drawer
- **Grid:** 12-column on desktop, 6-column on tablet, single-column on mobile
- **Buttons:** Full-width stacking on mobile; side-by-side on tablet/desktop
- **Cards:** 4-column on desktop, 2-column on tablet, single-column on mobile
- **Form Inputs:** Full-width on all breakpoints; inline labels collapse to stacked below `600px`
- **Padding:** `40px` desktop → `20px` tablet → `12px` mobile
- **Typography:** `26px` H1 on desktop → `22px` tablet → `18px` mobile

## 9. Agent Prompt Guide

### Quick Color Reference
- **Primary CTA:** Brand Pink (`#E0004D`) — all primary action buttons, critical interactions
- **Error States:** Error Red (`#E0004D` or `#F44336`) — validation failures, critical warnings
- **Success States:** Success Mint (`#A8DAB5`) — confirmations, positive information
- **Background / Default Surface:** White (`#FFFFFF`) — primary content area
- **Alternate Surface:** Off-White (`#FAFAFA`) — secondary content area
- **Heading Text:** Dark Gray (`#333333`) — all headings and high-contrast text
- **Body Text:** Dark Gray (`#333333`) — 12–16px paragraph copy
- **Border / Divider:** Light Gray (`#E5E7EB`) — subtle separation lines, form borders
- **Secondary Accent:** Cyan (`#75E5FF`) — highlight, badges, supporting UI
- **Tertiary Accent:** Teal (`#4DB6C1`) — secondary interactive states, informational containers
- **Disabled Text:** Medium Gray (`#424242`) at 50% opacity — inactive form labels, deemphasized text

### Iteration Guide

1. **All primary actions must use `#E0004D` background, `#FFFFFF` text, `16px` weight 700, `4px` radius, `8px 16px` padding minimum.** No exceptions for consistency.

2. **Body text must be `#333333` at 12–16px (never smaller than 12px); use weight 500 for default, 700 only for emphasis.** Maintain line-height of 1.4–1.5× font size.

3. **Cards and containers use `#FFFFFF` background with `1px solid #E5E7EB` border; apply `8px` border radius on elevated cards, `0px` on basic cards.** Subtle shadows only on hover.

4. **Form labels must be `14px` weight 700 `#333333`; inputs must be `40px` tall minimum with `1px solid #E5E7EB` border, `4px` radius, `8px 12px` padding.** Focus state adds `3px` ring in 10% opacity brand color.

5. **Navigation uses flat design with `16px` weight 400 text; active state is `#E0004D` bottom border `2px`, no background color change.** Hover is light gray background only.

6. **Spacing uses multiples of 4px (4, 8, 12, 16, 20, 24, 32, 40, 48, 52, 72, 100px); never use arbitrary spacing values.** Maintain consistent rhythm vertically and horizontally.

7. **All interactive elements (buttons, links, inputs) must have clear hover and focus states; hover increases shadow by 1 level, focus adds ring.** Never remove focus indicators for accessibility.

8. **Headings follow strict hierarchy: H1 26px weight 700, H2 18px weight 700, H3 14px weight 600; never skip levels in the hierarchy.** Use semantic HTML (h1–h3) for all heading text.

9. **Success information uses `#E6F3EF` background with `#045136` border and text (`1px solid`, `8px` radius); error uses `#FFE5EB` background with `#E0004D` text.** No exceptions for status states.

10. **Shadows are subtle and only applied at two levels: subtle (`0px 2px 8px rgba(0,0,0,0.08)`) for cards, medium (`0px 4px 12px rgba(0,0,0,0.12)`) for hover states.** Never use aggressive drop shadows; shadows must maintain light aesthetic.