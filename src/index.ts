import type { TSESLint } from "@typescript-eslint/utils";

import maxCommentLines from "./rules/max-comment-lines";
import noCommentCodeSnippet from "./rules/no-comment-code-snippet";
import noCommentNarrative from "./rules/no-comment-narrative";
import noDecorativeComment from "./rules/no-decorative-comment";
import noLineComment from "./rules/no-line-comment";

const configs: Record<string, TSESLint.FlatConfig.Config> = {};

const plugin: TSESLint.FlatConfig.Plugin = {
	meta: { name: "cyberash", version: "0.2.0" },
	rules: {
		"max-comment-lines": maxCommentLines,
		"no-comment-narrative": noCommentNarrative,
		"no-comment-code-snippet": noCommentCodeSnippet,
		"no-decorative-comment": noDecorativeComment,
		"no-line-comment": noLineComment,
	},
	configs,
};

configs.recommended = {
	plugins: { "comment-policy": plugin },
	rules: {
		"comment-policy/max-comment-lines": ["error", { max: 4, anchoredMax: 3 }],
		"comment-policy/no-comment-narrative": ["error"],
		"comment-policy/no-comment-code-snippet": ["error"],
		"comment-policy/no-decorative-comment": ["error"],
		"comment-policy/no-line-comment": ["error"],
	},
};

export default plugin;
