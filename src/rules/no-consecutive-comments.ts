import type { JSONSchema, TSESLint } from "@typescript-eslint/utils";

import { commentRuns } from "../lib/comment-runs";
import { compileProtected } from "../lib/protected";

const DEFAULT_MAX = 1;
const DEFAULT_TYPES: ReadonlyArray<"line" | "block"> = ["line", "block"];

interface NoConsecutiveCommentsOptions {
	types?: ("line" | "block")[];
	max?: number;
	skipBlankLines?: boolean;
	protectedPatterns?: string[];
}

type Options = readonly [NoConsecutiveCommentsOptions?];
type MessageIds = "consecutiveComments";

const schema: JSONSchema.JSONSchema4[] = [
	{
		type: "object",
		properties: {
			types: {
				type: "array",
				items: { type: "string", enum: ["line", "block"] },
			},
			max: { type: "integer", minimum: 1 },
			skipBlankLines: { type: "boolean" },
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
				"Forbid several stand-alone comments stacked one after another; merge or remove the extras.",
			url: "https://github.com/cyberash-dev/eslint-plugin-comment-policy#no-consecutive-comments",
		},
		schema,
		messages: {
			consecutiveComments:
				"{{count}} consecutive comments (> {{max}}); merge them into one or remove the extras",
		},
	},
	create(context) {
		const option = context.options[0] ?? {};
		const max = option.max ?? DEFAULT_MAX;
		const skipBlankLines = option.skipBlankLines ?? true;
		const types = new Set(option.types ?? DEFAULT_TYPES);
		const { detect } = compileProtected(option.protectedPatterns ?? []);
		const sourceCode = context.sourceCode;

		return {
			"Program:exit"(): void {
				for (const run of commentRuns(sourceCode, {
					types,
					skipBlankLines,
					detect,
				})) {
					if (run.comments.length > max) {
						context.report({
							loc: run.loc,
							messageId: "consecutiveComments",
							data: { count: run.comments.length, max },
						});
					}
				}
			},
		};
	},
};

export default rule;
