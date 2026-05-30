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
| `comment-policy/no-decorative-comment` | decorative / section markers (`=====`, `#region`, `===text===`) | yes |
| `comment-policy/no-line-comment` | any `//` comment; requires `/* */` | yes (converts and merges runs of `//`) |

A **comment block** is a run of consecutive full-line `//` comments separated
only by whitespace (no blank line). A **prose line** is a comment line that
still has a real word (≥3 letters) after comment markers and protected markers
are stripped, so anchor/marker-only lines do not count toward the cap.

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

`recommended` turns all five rules on at `error` with defaults. There is also an
`sdd` config that ships default `protectedPatterns` for spec-driven projects
(anchors `partition:TYPE-NNN`, `@covers`, short ids, milestones):

```js
import commentPolicy from "eslint-plugin-comment-policy";

export default [commentPolicy.configs.sdd];
```

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
			"comment-policy/no-decorative-comment": "error",
			"comment-policy/no-line-comment": "error",
		},
	},
];
```

## Options

### `protectedPatterns`

Shared across `max-comment-lines`, `no-comment-narrative`,
`no-comment-code-snippet`, `no-decorative-comment`, and `no-line-comment`. An
array of regular-expression **source strings**. A block that matches any pattern
is "protected": it gets the lower cap in `max-comment-lines` and is exempt from
`no-comment-narrative` / `no-comment-code-snippet` / `no-decorative-comment`.

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
  comment forms.
- ESLint applies non-overlapping fixes per pass and re-lints, so a block that is
  both a code snippet and a line comment is resolved across passes.

## Develop

- `npm run build` — tsdown, dual ESM + CJS + `.d.ts` into `dist/` (git-ignored).
- `npm test` — `RuleTester` suites via `tsx` (no build needed).
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — dogfoods `typescript-eslint` on the source.
