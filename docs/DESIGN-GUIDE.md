# PowerChain Renewable Miner OS — UI/UX Design Guide

**Version:** 1.2  
**Theme:** Light-first  
**Brand palette:** White · Light gray · Dark green · Black/charcoal

This guide is the canonical visual contract for:

- `apps/frontend` — public marketing website + PWA;
- `apps/console` — authenticated operations console;
- `apps/mobile` — Expo / React Native companion;
- reusable tokens in `packages/design-system`.

---

## 1. Design principles

### Operational, not decorative

Every component should answer one of four questions:

1. What is happening?
2. Is it healthy?
3. What evidence supports it?
4. What action is available to this role?

Avoid decorative dashboards that create density without operational meaning.

### Light-first

The default canvas is light gray, while important work surfaces remain white.

```text
Canvas       #F6F8F6
Surface      #FFFFFF
Muted        #F0F3F0
Border       #DCE3DE
Ink          #0D1510
Muted ink    #536058
Dark green   #0B3D25
Action green #176B3A
```

### No purple

Do not use:

- purple gradients;
- electric blue product accents;
- neon green;
- generic Web3 rainbow palettes;
- glossy crypto visual language.

Operational severity is differentiated by **label, icon, border weight and contrast**, not
by introducing a new brand color family.

### Evidence before action

High-consequence actions should visually present:

```text
state
→ evidence
→ policy / role
→ action
```

Examples:

- reward claim: amount → approval → wallet → settlement;
- source rotation: current hash → proposed hash → requester → approver;
- proof: physical Wh → source → verifier quorum → reward → chain reconciliation.

---

## 2. Color system

The implementation source is:

```text
packages/design-system/src/tokens.ts
packages/design-system/src/web.css
```

### Brand colors

| Token | Value | Usage |
|---|---:|---|
| `white` | `#FFFFFF` | Cards, headers, forms |
| `canvas` | `#F6F8F6` | App/page background |
| `surfaceMuted` | `#F0F3F0` | Secondary zones |
| `surfaceStrong` | `#E7ECE8` | Disabled/selected-neutral |
| `border` | `#DCE3DE` | Default border |
| `ink` | `#0D1510` | Primary typography |
| `inkMuted` | `#536058` | Secondary copy |
| `green950` | `#082D1C` | Dark hero/background |
| `green900` | `#0B3D25` | Primary CTA |
| `green800` | `#10552F` | Hover/active |
| `green700` | `#176B3A` | Positive status/data |
| `green100` | `#E7F4EB` | Positive surface |
| `green50` | `#F1F8F3` | Soft selected state |

### Status system

Do not rely on hue alone.

```text
Healthy / Confirmed
  green icon + green label + explicit text

Warning / Requested
  charcoal icon + gray surface + explicit text

Critical / Rejected / Offline
  black/charcoal icon + stronger border + explicit text
```

This preserves the requested brand palette and remains readable in grayscale.

---

## 3. Typography

Use the system sans stack by default:

```css
Inter,
ui-sans-serif,
-apple-system,
BlinkMacSystemFont,
"Segoe UI",
sans-serif
```

Do not use Inter as a decorative oversized display treatment. The UI should feel like an
operating system, not a startup landing-page template.

### Hierarchy

| Role | Desktop target |
|---|---:|
| Marketing display | 56–68 px |
| Page title | 36–44 px |
| Section title | 30–36 px |
| Card title | 16–21 px |
| Body | 14–17 px |
| Label | 10–12 px |
| Dense table | 11–13 px |

Use negative tracking only for large headlines. Dense operational text should prioritize
legibility.

---

## 4. Spacing

Base grid:

```text
4  8  12  16  20  24  32  40  48  64  80  96
```

Rules:

- page gutter desktop: 24–32 px;
- page gutter mobile: 16–20 px;
- card padding: 16–24 px;
- card gap: 8–16 px;
- section gap marketing: 64–96 px;
- table row minimum target: 44 px;
- touch target minimum: 44 × 44 px.

Avoid layouts that depend on tiny 6–8 px clickable controls.

---

## 5. Shape and elevation

### Radius

```text
8 px   controls
12 px  standard cards
16 px  feature/data cards
22 px  large product previews
999 px status pills
```

### Shadows

Most operational cards should use a border and almost no shadow.

Use elevated shadow only for:

- dialogs;
- command palette;
- PWA install prompt;
- floating product preview;
- mobile device mockup.

---

## 6. Web shell

### Marketing website

```text
sticky header
hero
feature grid
Proof-of-Energy flow
architecture
mobile companion
security
footer
```

Every section lives in its own component under:

```text
apps/frontend/components/sections/
```

### Console

Desktop shell:

```text
252 px sidebar
72 px top bar
content canvas
12–16 px cards
dense operational tables
```

Primary navigation:

```text
Dashboard
Network
Miners
Proof of Energy
Rewards
Clients
Audit & Logs
Alerts
Reports
Settings
```

Do not hide critical state behind hover-only UI.

---

## 7. Mobile

`apps/mobile` is a companion operations app, not a smaller copy of the desktop console.

Primary tabs:

```text
Overview
Miners
Rewards
More
```

Mobile principles:

- prioritize network status and active incidents;
- KPI cards use 2-column layout;
- avoid desktop tables;
- use stacked rows with explicit labels;
- keep blockchain addresses truncated but copyable when real data is wired;
- never store treasury authority, verifier keys or program upgrade authority in the app.

---

## 8. Cards

### KPI card

Required:

```text
label
primary value
time window / change
optional source freshness
```

Do not show an unlabeled number.

### Proof card

Required:

```text
proof ID
device
observed time
energy Wh
source hash
evidence status
reward
chain status
reconciliation method
```

### Reward claim

Show lifecycle explicitly:

```text
REQUESTED
APPROVED
PREPARED
SUBMITTED
CONFIRMED
```

Do not collapse approval and wallet authorization into one “Pay” action.

---

## 9. Tables

Use tables only on wide surfaces.

Rules:

- sticky/clear column header;
- left-align identity/text;
- right-align numeric values;
- status as text + pill;
- actions at far right;
- pagination below;
- filters above;
- no horizontal overflow on standard laptop widths.

At mobile breakpoints, convert to stacked records.

---

## 10. Forms

Labels are always visible.

Use:

```text
label
input
help / error
```

not placeholder-only forms.

Destructive or high-consequence changes require context:

```text
Current source:  7af3…
New source:      18d2…
Requester:       operator@example
Approval:        Verifier required
```

---

## 11. Buttons

### Primary

Dark green fill:

```text
#0B3D25
```

Use for one dominant action per panel.

### Secondary

White surface + gray border.

### Ghost

No border. Use only for low-risk secondary navigation.

Button text should describe the action:

```text
Verify Solana binding
Request source rotation
Prepare claim
Claim on Solana
Create checkpoint
```

Avoid vague `Submit`, `OK`, or `Continue` in operational workflows.

---

## 12. Icons

Use simple outline iconography.

Rules:

- 16–20 px standard;
- 20–24 px primary nav;
- stroke weight should remain consistent;
- no emoji;
- no 3D crypto icons in core operations;
- token/network logos may use official marks where needed.

---

## 13. Charts

Charts use:

```text
dark green primary series
light green fill
gray grid
black labels
```

No multi-color rainbow charts.

Use direct labels where possible. Legends should not be the only way to understand a series.

---

## 14. PWA

`apps/frontend/components/PWA.tsx` controls install UX.

The service worker:

- does not cache `/api/*`;
- uses network-first navigation;
- caches only static same-origin assets;
- provides the landing page as offline fallback.

Never cache authenticated console API responses in the public PWA service worker.

---

## 15. Accessibility

Minimum requirements:

- WCAG AA contrast for body and controls;
- keyboard-visible focus;
- semantic landmarks;
- table headers;
- `aria-label` for icon-only controls;
- reduced-motion support;
- status never expressed only by color;
- 44 px mobile touch targets.

---

## 16. Responsive breakpoints

Reference ranges:

```text
≤ 560 px   compact mobile
≤ 760 px   mobile
≤ 1050 px  tablet / narrow laptop
> 1050 px  desktop
```

Do not solve overflow by shrinking text below readable sizes.

Instead:

```text
3-column cards → 2 → 1
desktop table → stacked records
dual pane → vertical stack
sidebar → drawer
```

---

## 17. Product copy

Use specific technical terms:

```text
Proof of Energy
Evidence verifier
Reward owner
Token-2022
ClaimReceipt
Device binding
Source rotation
Solana reconciliation
```

Avoid marketing language that implies:

- SOL is mined;
- physical electricity exists on-chain;
- a signature proves meter truth;
- AI independently authorizes settlement.

---

## 18. Canonical implementation

```text
packages/design-system/
  src/tokens.ts
  src/native.ts
  src/web.css

apps/frontend/
  components/
    PWA.tsx
    sections/*

apps/console/
  authenticated operator UI

apps/mobile/
  React Native screens/components
```

Any new product surface should consume these tokens before adding local colors or spacing.


## 19. Agent Compute

Agent Compute screens use a distinct information order:

```text
Agent identity
→ available / reserved credit
→ endpoint
→ API-key state
→ funding policy
→ recent usage
→ top-up history
```

### Balance

Always distinguish:

```text
Balance
Reserved
Available
```

Do not display a single balance while requests are in flight.

### API keys

The one-time secret must appear in a dedicated high-contrast panel immediately after
creation.

Required copy:

```text
ONE-TIME SECRET
Copy this key now. PowerChain stores only its hash.
```

Never render the secret again from persisted state.

### Auto-top up

The policy form must show all autonomous bounds together:

```text
enabled
preferred chain
funding asset
low-balance threshold
top-up amount
daily cap
```

Do not use a single unbounded "auto fund" toggle.

### Endpoint

Use monospaced text for:

```text
https://compute.powerchain.energy/v1
```

The endpoint is not a CTA; it is a copy/configuration surface.

### Usage

Usage rows should show:

```text
request ID
public model
state
input / output tokens
actual cost
```

An `AUTHORIZED` request is a reservation, not settled spend.
