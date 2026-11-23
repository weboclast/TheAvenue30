---
name: motion
description: >-
  Writes animation with Motion (formerly Framer Motion) where a CSS transition
  or an Appica UI component does not already cover it: drag and gestures,
  scroll-linked and parallax effects, shared-element transitions between routes,
  orchestrated sequences, spring physics, layout (FLIP) animations, and SVG path
  morphing. Use on requests like "animate", "parallax", "make it slide in on
  scroll", "drag to reorder", or "smooth transition between", and on any hero or
  carousel described as motion-heavy. Covers the Server Component boundary Motion
  needs in this App Router project, and the reduced-motion and bundle-size rules
  that apply here.
license: MIT
---

# Motion

Motion (package `motion`, formerly `framer-motion`) is the animation library
`@appica/ui-react` uses internally. This skill is for animation you write
yourself.

## Before you reach for it

1. **Check the library first.** Appica UI already animates, through 2 mechanisms,
   and both honor reduced motion without you doing anything. Overlays (Dialog,
   Drawer, Popover, Tooltip, and friends) animate in CSS through Base UI's
   `data-starting-style` and `data-ending-style` hooks, gated behind Tailwind's
   `motion-safe:` variant. A set of form and feedback components uses Motion
   internally: Alert, Checkbox, Chip, Countdown, Loader, Number Field, Radio,
   Rating, Slider, Spinner, Switch. Carousel animates through Embla. Restyling
   any of those means overriding the classes, not adding a second animation
   layer on top.
2. **Motion is already a dependency**, at the version `@appica/ui-react`
   resolves, so the bundle carries 1 copy. Keep the 2 in step: if an update to
   `@appica/*` moves the library to a new `motion` major, move this project's
   range with it, or `pnpm why motion` will list 2 versions.

## In this project

- **`'use client'` is required.** Every file that imports from `motion/react`
  needs the directive. Put it on the smallest component, not on the page: a
  motion wrapper around static children keeps the children on the server.
- **Honor `prefers-reduced-motion`.** Wrap animated regions in `MotionConfig`
  with `reducedMotion="user"`, or read `useReducedMotion()` and skip the
  transition. This is not optional in this template. Appica UI also ships
  `ReducedMotionProvider` for its own components.
- **Don't mix with Tailwind transitions.** A `transition-*` class on an animated
  element fights Motion for the same properties and produces stutter. Pick one.
- **Animate transforms and opacity.** `x`, `y`, `scale`, `rotate`, and `opacity`
  are compositor-friendly. Animating `width`, `height`, `top`, or `left` forces
  layout on every frame; use the `layout` prop instead, which does it as a FLIP
  transform.
- **RTL still applies.** An `x` offset is physical. Flip its sign by direction,
  or animate a logical property, so a slide-in doesn't reverse in Arabic.

## Core API

```tsx
'use client'
import { motion, AnimatePresence } from 'motion/react'

// Animate on mount, and on any state change.
<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} />

// Exit animations need AnimatePresence *outside* the condition, with a stable key.
<AnimatePresence>{open && <motion.div key="panel" exit={{ opacity: 0 }} />}</AnimatePresence>

// Variants orchestrate a tree: the parent drives children by name.
const list = { show: { transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0 }, show: { opacity: 1 } }
<motion.ul variants={list} initial="hidden" animate="show">
  <motion.li variants={item} />
</motion.ul>

// Gestures, scroll, and layout.
<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} drag="x" />
<motion.div layout />                       // FLIP between layout changes
const { scrollYProgress } = useScroll()     // scroll-linked values
```

## Gotchas

- **`AnimatePresence` goes outside the conditional, not inside it.** Wrapping the
  whole thing in `{isVisible && …}` unmounts the component that was supposed to
  play the exit, so the element just vanishes. Every child needs a stable `key`.
- **`layoutScroll` on a scrollable container.** Without it, layout animations
  inside a scrolled container land in the wrong place.
- **`layoutRoot` on a `position: fixed` ancestor**, for the same reason.
- **`layoutId` inside `AnimatePresence` can fail to unmount.** Wrap the set in
  `LayoutGroup`, or don't combine `exit` with a shared `layoutId`.
- **Avoid `Reorder` in the App Router.** It has open issues with Next.js routing
  and sticks in odd states. Build drag-to-reorder from `drag` and `onDragEnd`.
- **Large animated lists need virtualization** past roughly 50 items. Animating
  every row at once drops frames regardless of how simple each animation is.

## Going deeper

Read one of these when the task calls for it, not up front:

| File | Read it when |
| --- | --- |
| `references/nextjs-integration.md` | Route transitions, server/client boundary questions, App Router specifics. Skip its Pages Router section |
| `references/performance-optimization.md` | An animation drops frames, or the bundle grew. Covers `LazyMotion` and virtualization |
| `references/common-patterns.md` | A scroll reveal, a parallax hero, a shared underline, or drag. For a modal, accordion, tabs, carousel, or toast, use the Appica UI component |
| `templates/motion-nextjs-client.tsx` | A starting point for a client motion component |
| `templates/scroll-parallax.tsx` | Scroll-linked and parallax scaffolding |
| `templates/layout-transitions.tsx` | Shared-element and layout transition scaffolding |
| `templates/ui-components.tsx` | Animated pieces to adapt, where no Appica UI component fits |

Official documentation: https://motion.dev/docs/react
