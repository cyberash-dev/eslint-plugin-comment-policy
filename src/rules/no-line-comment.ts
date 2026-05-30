import type { JSONSchema, TSESLint } from "@typescript-eslint/utils";

import {
	type CommentBlock,
	type LineIndex,
	blockLoc,
	commentBlocks,
	makeLineIndex,
} from "../lib/comment-blocks";
import { isDecorativeLine } from "../lib/decorative";
import { compileProtected, hasProtectedToken, strippedLine } from "../lib/protected";

interface LineCommentOptions {
	protectedPatterns?: string[];
}

type Options = readonly [LineCommentOptions?];
type MessageIds = "lineComment";

const schema: JSONSchema.JSONSchema4[] = [
	{
		type: "object",
		properties: {
			protectedPatterns: { type: "array", items: { type: "string" } },
		},
		additionalProperties: false,
	},
];

interface Conversion {
	range: [number, number];
	text: string;
}

/* Rebuild a run of line comments as a single block comment, dropping decorative
   (non-protected) lines and bailing out when the prose itself contains a
   block-comment terminator. */
function buildConversion(
	block: CommentBlock,
	text: string,
	detect: readonly RegExp[],
	lineIndex: LineIndex,
): Conversion | null {
	const indent = text.slice(lineIndex.lineStart(block.startLine), block.start);
	const kept: string[] = [];
	for (const rawLine of block.raw.split("\n")) {
		const content = strippedLine(rawLine);
		if (
			block.fullLine &&
			isDecorativeLine(content) &&
			!hasProtectedToken(rawLine, detect)
		) {
			continue;
		}
		kept.push(content);
	}
	if (kept.some((c) => c.includes("*/"))) {
		return null;
	}
	if (block.fullLine && kept.every((c) => c.length === 0)) {
		return {
			range: [
				lineIndex.lineStart(block.startLine),
				lineIndex.lineEnd(block.endLine),
			],
			text: "",
		};
	}
	const body =
		kept.length === 1
			? `/* ${kept[0]} */`
			: `/*\n${kept
					.map((c) => (c ? `${indent} * ${c}` : `${indent} *`))
					.join("\n")}\n${indent} */`;
	return { range: [block.start, block.end], text: body };
}

const rule: TSESLint.RuleModule<MessageIds, Options> = {
	defaultOptions: [{}],
	meta: {
		type: "suggestion",
		fixable: "code",
		docs: {
			description:
				"Forbid line comments (`//`); require block `/* */` comments. Auto-fix converts and merges runs of `//`.",
			url: "https://github.com/cyberash-dev/eslint-plugin-comment-policy#no-line-comment",
		},
		schema,
		messages: {
			lineComment: "line comment; use a block /* */ comment",
		},
	},
	create(context) {
		const option = context.options[0] ?? {};
		const { detect } = compileProtected(option.protectedPatterns ?? []);
		const sourceCode = context.sourceCode;
		const lineIndex = makeLineIndex(sourceCode.text);

		return {
			"Program:exit"(): void {
				for (const block of commentBlocks(sourceCode, detect)) {
					if (block.kind !== "line") {
						continue;
					}
					const conv = buildConversion(
						block,
						sourceCode.text,
						detect,
						lineIndex,
					);
					context.report({
						loc: blockLoc(block),
						messageId: "lineComment",
						fix: conv
							? (fixer) => fixer.replaceTextRange(conv.range, conv.text)
							: null,
					});
				}
			},
		};
	},
};

export default rule;
