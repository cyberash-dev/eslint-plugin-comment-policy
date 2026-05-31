# AGENTS.md — adopting eslint-plugin-comment-policy

Six ESLint 9 (flat-config) rules enforcing a comment policy, namespace
`comment-policy/`:

- `comment-policy/max-comment-lines` — prose-line cap per comment block
  (default `max` 4, `anchoredMax` 3).
- `comment-policy/no-comment-narrative` — change-narrative / history prose.
- `comment-policy/no-comment-code-snippet` — code snippet inside a comment.
- `comment-policy/no-consecutive-comments` — several stand-alone comments in a
  row (default `max` 1, `types` line+block, `skipBlankLines` true).
- `comment-policy/no-decorative-comment` — decorative / section markers.
- `comment-policy/no-line-comment` — `//` forbidden, `/* */` required.

## Adopt in a repo

1. `npm install --save-dev eslint-plugin-comment-policy`.
2. In `eslint.config.mjs`, use a bundled config or register rules explicitly:

   ```js
   import commentPolicy from "eslint-plugin-comment-policy";
   export default [commentPolicy.configs.recommended];
   ```

   `recommended` turns **all six rules on at `error`** with defaults.

## Rule behavior an agent must know

- A **comment block** is a run of consecutive full-line `//` separated only by
  whitespace (no blank line); they are linted and fixed as one unit.
- **Protected** blocks (matching `protectedPatterns`) get the lower cap in
  `max-comment-lines` and are exempt from narrative / snippet / decorative
  checks. Marker/anchor-only lines never count as prose.
- Fixable: `no-comment-code-snippet` (delete only when the block is entirely
  code), `no-decorative-comment` (drop the line), `no-line-comment` (convert and
  merge `//` into one `/* */`; skipped when the prose contains `*/`).
  `max-comment-lines` and `no-comment-narrative` are judgment calls, so no fix.
