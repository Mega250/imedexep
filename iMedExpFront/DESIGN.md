# Design

Visual system for iMedExp (Expo / React Native, web + native). Captured from the live code in `src/theme` and `src/atomic`. Source of truth is `src/theme/tokens.ts`, `src/theme/fonts.ts`, `src/theme/typography.ts`; this file documents it so new screens stay on-brand.

## Theme

Light, clinical, single theme. A near-white cyan-tinted `paper` canvas with deep navy ink, one clinical blue accent, and a soft elevation system. The mood is a calm, well-lit consulting room. No dark mode today.

## Color

OKLCH-equivalent hex, defined in `src/theme/tokens.ts` as `colors`. The identity is committed (these are real brand values; preserve them).

### Surfaces (paper ramp)
- `paper` `#F1FAFE` — app background
- `paper2` `#E0F4FA`, `paper3` `#CAF0F8`, `paper4` `#ADE8F4` — tinted surfaces, soft fills
- `white` `#FFFFFF` — cards

### Ink (text + deep accents)
- `ink` `#03045E` — primary text, darkest
- `ink2` `#023E8A` — secondary text / strong labels
- `ink3` `#0077B6` — tertiary text, metadata, icons
- `ink4` `#48CAE4`, `ink5` `#90E0EF` — light accents
- `inkDeep` `#02022F` — deepest

### Rules (borders / hairlines)
- `rule` `#BFE2EF`, `rule2` `#DDF0F6`, `rule3` `#ECF7FB` (lightest)

### Accent (primary action + selection + state)
- `accent` `#0096C7` — primary action
- `accentBright` `#00B4D8`, `accentDeep` `#023E8A`, `accentInk` `#03045E`
- `accentSoft` `#CAF0F8` — soft accent fill (tags, live pills)
- `accentRule` `#90E0EF`

### Semantic
- Alert: `alert` `#B83232`, `alertSoft` `#FBE9E8`, `alertRule` `#F1C3C0`
- OK: `ok` `#1C8C5A`, `okSoft` `#E5F5EE`, `okRule` `#BFE3CF`
- Warning: `mid` `#C97A12`

**Contrast rule:** clinician-read body/data uses `ink` or `ink2`. `ink3` is for metadata only, never long body text on `paper`. Status (borrador/firmado/enviado) pairs color with a label and icon, never color alone.

## Typography

Three families (`src/theme/fonts.ts`, exposed via `family` in `src/theme/typography.ts`). Pairing is on a contrast axis: geometric sans (Geist) for everything functional, a serif (Instrument Serif) reserved for patient names and warm headings, a mono (Geist Mono) for labels/metadata/codes.

- **Geist** — `thin/extralight/light/regular/medium/semibold/bold` (100–700). UI text, buttons, body, numbers.
- **Geist Mono** — `mono` (400), `monoMedium` (500). Eyebrows, labels, identifiers, units, timestamps.
- **Instrument Serif** — `serif`, `serifItalic` (400). Patient names, occasional display. Italic is the signature note.

Helpers in `text`:
- `text.eyebrow` — mono 11, letterSpacing 1.3, uppercase. Section/field labels (short only).
- `text.mono` — mono, letterSpacing -0.1. Data/metadata.
- `text.serif` — serifItalic. Names.

Patterns seen in pages: patient name = serifItalic ~22/26, letterSpacing -0.4, `ink`; eyebrow = mono ~9.5–11 uppercase `ink3`; body = Geist regular 11–13 `ink2`; section labels via `SectionLabel`. Product-register scale: fixed sizes (not fluid clamp), tight steps.

## Spacing, radius, elevation

- `spacing` (4px base): `xs 4, sm 8, md 12, lg 16, xl 22, xxl 28, page 22`.
- `radii`: `sm 8, md 12, lg 16, xl 22, xxl 28, pill 999`. Cards default `lg`; inner cells `md`; pills/tags `pill`.
- `shadow` (platform-aware, navy-tinted): `soft` (panels), `card` (cards), `floating` (FAB/sticky), `hero`. Web emits `boxShadow`, native emits `shadowColor/Offset/Opacity/Radius/elevation`.

## Components (atomic)

`src/atomic/{atoms,molecules,organisms,templates,pages}`. Reuse before inventing.

- **Atoms:** `Button` (variants `primary|accent|bright|ghost|darkGhost`, sizes `sm|md|lg`, `block`, `iconLeft/Right`, `height`, `radius`), `Card` (radius/border/background), `Pill` (on/tone `default|alert|ok`/count), `Badge` (mono tag, dot), `TextField`, `Avatar` (initials, serif, radius), `Icon` (named `kind` set), `SectionLabel`, `Tappable` (scaleTo press), `FadeIn`, `Divider`, `Switch`, `RoundIconButton`.
- **Molecules:** `FormField` (label+TextField+hint/error/valid), `SelectField` (dropdown), `SurfaceCard` (titled card + action), `Section` (titled block + action), `Stepper`, `DatePickerField`, `MultiSelectField`, `StatTile`, `KpiCard/KpiGrid`, `TimelineList`, `FilterPillRow`, `Pagination`, `ProgressBar`, `ToggleRow`, `FAB`, `RecordFormModal`.
- **Organisms:** `ScreenTopBar`, tab bars (`DoctorTabBar`, `PatientTabBar`…), `DesktopSidebar/TopBar/SubTabs`, `PermissionMatrix`, `WeekGrid`.
- **Templates:** `MobileScreen` (header / scroll content / tabBar / floating / keyboardAware), `DesktopShell` (sidebar nav + top bar + content), `NativeSurface`. Mobile and desktop are **separate page files** (`M*Page` / `Dsk*DesktopPage`), registered in `nativeRegistry` / `desktopRegistry`, routed by `goToScreen(id)`; the router picks the variant by width.

## Motion

Subtle, state-conveying, product-register timing (150–250ms). `FadeIn` with small staggered delays (~60–70ms) on entrance; `Tappable` scales to ~0.93–0.96 on press. No orchestrated page-load sequences. Respect `prefers-reduced-motion` with an instant/crossfade fallback.

## Iconography

Single hand-rolled set via `Icon kind="…"` (e.g. `arrow`, `arrow-l`, `chev`, `pen`, `heart`, `doc`, `pill`, `home`, `users`, `cal`, `clip`, `rx`, `check`, `edit`, `user`). Use existing kinds; don't introduce a second icon library.
