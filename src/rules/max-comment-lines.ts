import type { JSONSchema, TSESLint } from "@typescript-eslint/utils";

import { blockLoc, commentBlocks } from "../lib/comment-blocks";
import { compileProtected, isProseLine } from "../lib/protected";

const DEFAULT_MAX = 4;
const DEFAULT_ANCHORED_MAX = 3;

interface CommentLinesOptions {
	max?: number;
	anchoredMax?: number;
	protectedPatterns?: string[];
}

type Options = readonly [CommentLinesOptions?];
type MessageIds = "tooManyProse" | "tooManyProseAnchored";

const schema: JSONSchema.JSONSchema4[] = [
	{
		type: "object",
		properties: {
			max: { type: "integer", minimum: 0 },
			anchoredMax: { type: "integer", minimum: 0 },
			protectedPatterns: { type: "array", items: { type: "string" } },
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
				"Cap the number of prose lines in a comment block (anchored blocks get a lower cap).",
			url: "https://github.com/cyberash-dev/eslint-plugin-comment-policy#max-comment-lines",
		},
		schema,
		messages: {
			tooManyProse:
				"comment block has {{count}} prose lines (> {{max}}); keep it to a short why or move it into a spec record",
			tooManyProseAnchored:
				"anchored comment has {{count}} prose lines (> {{max}}); the rationale belongs in the spec record — keep the marker plus at most a one-line pointer",
		},
	},
	create(context) {
		const option = context.options[0] ?? {};
		const max = option.max ?? DEFAULT_MAX;
		const anchoredMax = option.anchoredMax ?? DEFAULT_ANCHORED_MAX;
		const { detect, strip } = compileProtected(option.protectedPatterns ?? []);
		const sourceCode = context.sourceCode;

		return {
			"Program:exit"(): void {
				for (const block of commentBlocks(sourceCode, detect)) {
					const proseLineCount = block.raw
						.split("\n")
						.filter((line) => isProseLine(line, strip)).length;
					const cap = block.hasProtected ? anchoredMax : max;
					if (proseLineCount > cap) {
						context.report({
							loc: blockLoc(block),
							messageId: block.hasProtected
								? "tooManyProseAnchored"
								: "tooManyProse",
							data: { count: proseLineCount, max: cap },
						});
					}
				}
			},
		};
	},
};

export default rule;
