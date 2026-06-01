# eslint-plugin-comment-policy

[Русская версия](./README.ru.md)

ESLint 9 (flat-config) rules that enforce a **comment policy** in the editor and
in CI: cap prose, keep change-history out of comments, ban code snippets and
decorative markers, and require block comments. The policy shows up as you type
instead of only on a separate review pass.

Namespace: `comment-policy/`. Plugin scope (`meta.name`): `cyberash`.

## Rules

| Rule | What it flags | Fixable |
|---|---|---|
| `comment-policy/max-comment-lines` | a comment block with more prose lines than the cap (lower cap for anchored blocks) | no |
| `comment-policy/no-comment-narrative` | change-narrative / history prose (`renamed from`, `previously`, `v1.2`, bare ISO dates, …) | no |
| `comment-policy/no-comment-code-snippet` | a code snippet (usage example) inside a comment | yes (only when the block is entirely code) |
| `comment-policy/no-consecutive-comments` | several stand-alone comments stacked one after another (more than `max`) | no |
| `comment-policy/no-decorative-comment` | decorative / section markers, ASCII and Unicode (`=====`, `#region`, `===text===`, `────`, `══ text ══`) | yes |
| `comment-policy/no-line-comment` | any `//` comment; requires `/* */` | yes (converts and merges runs of `//`) |

A **comment block** is a run of consecutive full-line `//` comments separated
only by whitespace (no blank line). A **prose line** is a comment line that
still has a real word (≥3 letters) after comment markers and protected markers
are stripped, so anchor/marker-only lines do not count toward the cap. A
**comment run** (used by `no-consecutive-comments`) is a sequence of full-line
comments of an enabled kind separated only by whitespace; a multi-line `/* */`
counts as one comment, and code or a comment of a non-enabled kind breaks the
run.

## Install

```sh
npm install --save-dev eslint-plugin-comment-policy
```

## Usage

`eslint.config.mjs` — bundled config:

```js
import commentPolicy from "eslint-plugin-comment-policy";

export default [commentPolicy.configs.recommended];
```

`recommended` turns all six rules on at `error` with defaults.

Or register the plugin and enable rules explicitly:

```js
import commentPolicy from "eslint-plugin-comment-policy";

export default [
	{
		plugins: { "comment-policy": commentPolicy },
		rules: {
			"comment-policy/max-comment-lines": ["error", { max: 4, anchoredMax: 3 }],
			"comment-policy/no-comment-narrative": "error",
			"comment-policy/no-comment-code-snippet": "error",
			"comment-policy/no-consecutive-comments": "error",
			"comment-policy/no-decorative-comment": "error",
			"comment-policy/no-line-comment": "error",
		},
	},
];
```

## Options

### `protectedPatterns`

Shared across `max-comment-lines`, `no-comment-narrative`,
`no-comment-code-snippet`, `no-consecutive-comments`, `no-decorative-comment`,
and `no-line-comment`. An array of regular-expression **source strings**. A block
that matches any pattern is "protected": it gets the lower cap in
`max-comment-lines`, is exempt from `no-comment-narrative` /
`no-comment-code-snippet` / `no-decorative-comment`, and is excluded from
`no-consecutive-comments` runs.

Order matters: put the longer/more specific pattern first so a marker is fully
stripped before a shorter pattern that is its suffix.

### `max-comment-lines`

```js
["error", { max: 4, anchoredMax: 3, protectedPatterns: [] }]
```

- `max` (default `4`) — prose-line cap for an ordinary block.
- `anchoredMax` (default `3`) — prose-line cap for a protected (anchored) block.

### `no-comment-narrative`

```js
["error", { protectedPatterns: [], extraPatterns: [] }]
```

- `extraPatterns` — extra narrative patterns (source strings) added to the
  built-in set.

### `no-consecutive-comments`

```js
["error", { types: ["line", "block"], max: 1, skipBlankLines: true, protectedPatterns: [] }]
```

- `types` (default `["line", "block"]`) — which comment kinds participate in a
  run: `line` (`//`) and/or `block` (`/* */`). A comment of a kind not listed
  breaks the run.
- `max` (default `1`) — how many consecutive comments are allowed; a run longer
  than `max` is reported (with `max: 1`, any second comment in a row is flagged).
- `skipBlankLines` (default `true`) — when `true`, comments separated only by
  blank lines still count as consecutive; set `false` to let a blank line break
  the run.

### `no-comment-code-snippet`, `no-decorative-comment`, `no-line-comment`

```js
["error", { protectedPatterns: [] }]
```

`no-comment-code-snippet` auto-deletes a block only when it is entirely code
(every non-empty line is code-ish) and occupies whole lines. `no-line-comment`
converts a run of `//` into one `/* */` block; it leaves a comment untouched
when its prose contains `*/` (which would terminate the block early).

## Notes

- `no-decorative-comment` detects markers by content in both `//` and `/* */`
  comment forms. The divider charset covers ASCII (`= * # _ - ~`) and Unicode
  box-drawing / dash runs (`─ ━ ═ │ ┃ ║`, en/em-dash), so banners like
  `/* ── Section ────── */` are caught; a single such glyph inside prose is not.
- ESLint applies non-overlapping fixes per pass and re-lints, so a block that is
  both a code snippet and a line comment is resolved across passes.

## Develop

- `npm run build` — tsdown, dual ESM + CJS + `.d.ts` into `dist/` (git-ignored).
- `npm test` — `RuleTester` suites via `tsx` (no build needed).
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — dogfoods `typescript-eslint` on the source.
