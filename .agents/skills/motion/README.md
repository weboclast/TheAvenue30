# motion

Third-party skill, vendored into this template. Covers Motion (formerly Framer
Motion), the animation library `@appica/ui-react` already depends on, so using
it here adds no bundle weight.

- Source: https://github.com/jezweb/claude-skills
- License: MIT, in `LICENSE`
- Changes: trimmed `SKILL.md` to a router over `references/`, and dropped the
  plugin manifest, the Vite template and setup scripts, and the AutoAnimate
  comparison, which recommends a library this project does not use.

`SKILL.md` is the entry point. `references/` holds the detail it points at,
`templates/` holds copy-paste starting points.
