# Product

## Register

product

## Users

Primarily **médicos** (doctors) seeing patients inside a clinic or hospital, plus **pacientes**, **secretarias**, **administradores de institución** and **superadmins**. The app is the clinical record (expediente) and the operational layer around it: agenda, consultas, recetas, signos vitales, historia clínica, QR de acceso. Context of use is Mexican healthcare (CURP, CIE-10, Spanish UI, mmHg/mg·dL units), on phones at the bedside and on desktop at a workstation. The doctor's job on any given screen is to read a patient's state fast and record a clinical act accurately, under time pressure, without losing trust in the data.

## Product Purpose

iMedExp is a multi-role clinical records platform. It lets clinics run the full patient encounter: schedule and attend appointments, open and record consultations, prescribe and sign, capture vitals and clinical history, and share access by QR. Success is a doctor finishing a consultation with a complete, signed, legally-defensible record in fewer taps than paper, and a patient who can see and carry their own history. The product serves the task; the interface should disappear into clinical work.

## Brand Personality

Calm, precise, trustworthy. Three words: **clínico, legible, sereno**. The voice is plain clinical Spanish, never marketing. It should feel like a well-run consulting room: quiet confidence, nothing flashy, every number readable at a glance. Warmth comes from the Instrument Serif patient names and the soft cyan palette, not from playfulness.

## Anti-references

- Generic SaaS dashboards (hero-metric template, identical card grids, gradient accents).
- Neon "health-tech" with saturated gradients and glassmorphism.
- Consumer wellness apps (rounded, gamified, emoji-led, childish).
- Dense EHR enterprise software that dumps every field on one grey screen with no hierarchy.

## Design Principles

- **The record disappears into the task.** The doctor is mid-encounter; the UI is a calm surface for reading state and committing a clinical act, not a thing to admire.
- **Legibility is safety.** Vitals, doses and identifiers must be unambiguous at a glance. Contrast and number formatting are clinical-grade, not decorative.
- **Density with breathing room.** Show what the clinician needs (vitals, dx, meds) without clutter; use rhythm and whitespace so dense data stays scannable.
- **Trust through honesty.** Never show a control that doesn't persist, never imply a signature that didn't happen. States (borrador / firmado / enviado) are explicit.
- **Spanish-first clinical vocabulary.** Motivo, síntomas, exploración, diagnóstico, receta, firmar. Labels match how the clinician speaks.

## Accessibility & Inclusion

Target WCAG AA. Body and data text must clear 4.5:1 against the very light `paper` backgrounds — lean on `ink`/`ink2`, not light greys, for anything a clinician reads. Touch targets ≥44px at the bedside. Honor `prefers-reduced-motion` (the app already uses subtle FadeIn; provide an instant alternative). Status must not rely on color alone — pair dx/receta states with text and icon. Works at mobile and desktop widths with separate, deliberate layouts.
