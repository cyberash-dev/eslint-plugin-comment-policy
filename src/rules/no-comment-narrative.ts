import type { JSONSchema, TSESLint } from "@typescript-eslint/utils";

import { blockLoc, commentBlocks } from "../lib/comment-blocks";
import { compileProtected } from "../lib/protected";

const NARRATIVE = [
	/\brenamed?\s+from\b/i,
	/\bformerly\b/i,
	/\bpreviously\b/i,
	/\bas before\b/i,
	/\bused to\b/i,
	/\badded\s+(?:for|to|because)\b/i,
	/\bfix(?:es|ed)?\s+(?:bug|issue)\b/i,
	/\bslice\s+\d+\b/i,
	/\bv\d+\.\d+\b/i,
	/\b\d{4}-\d{2}-\d{2}\b/,
];

interface NarrativeOptions {
	protectedPatterns?: string[];
	extraPatterns?: string[];
}

type Options = readonly [NarrativeOptions?];
type MessageIds = "changeNarrative";

const schema: JSONSchema.JSONSchema4[] = [
	{
		type: "object",
		properties: {
			protectedPatterns: { type: "array", items: { type: "string" } },
			extraPatterns: { type: "array", items: { type: "string" } },
		},
		additionalProperties: false,
	},
];

const rule: TSESLint.RuleModule<MessageIds, Options> = {
	defaultOptions: [{}],
	meta: {
		type: "suggestion",
		docs: {
			description:
				"Forbid change-narrative / history prose in comments (it belongs in the commit message or a spec record).",
			url: "https://github.com/cyberash-dev/eslint-plugin-comment-policy#no-comment-narrative",
		},
		schema,
		messages: {
			changeNarrative:
				"change-narrative / history prose (belongs in commit message or spec record)",
		},
	},
	create(context) {
		const option = context.options[0] ?? {};
		const { detect } = compileProtected(option.protectedPatterns ?? []);
		const extra = (option.extraPatterns ?? []).map((source) => new RegExp(source));
		const patterns = [...NARRATIVE, ...extra];
		const sourceCode = context.sourceCode;

		return {
			"Program:exit"(): void {
				for (const block of commentBlocks(sourceCode, detect)) {
					if (block.hasProtected) {
						continue;
					}
					if (patterns.some((re) => re.test(block.raw))) {
						context.report({
							loc: blockLoc(block),
							messageId: "changeNarrative",
						});
					}
				}
			},
		};
	},
};

export default rule;
