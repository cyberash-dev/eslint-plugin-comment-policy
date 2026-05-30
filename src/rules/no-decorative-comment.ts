import type { JSONSchema, TSESLint, TSESTree } from "@typescript-eslint/utils";

import { commentBlocks, makeLineIndex } from "../lib/comment-blocks";
import { isDecorativeLine } from "../lib/decorative";
import { compileProtected, hasProtectedToken, strippedLine } from "../lib/protected";

interface DecorativeOptions {
	protectedPatterns?: string[];
}

type Options = readonly [DecorativeOptions?];
type MessageIds = "decorativeComment";

const schema: JSONSchema.JSONSchema4[] = [
	{
		type: "object",
		properties: {
			protectedPatterns: { type: "array", items: { type: "string" } },
		},
		additionalProperties: false,
	},
];

function lineLoc(lineNo: number, text: string): TSESTree.SourceLocation {
	return {
		start: { line: lineNo, column: 0 },
		end: { line: lineNo, column: text.length },
	};
}

const rule: TSESLint.RuleModule<MessageIds, Options> = {
	defaultOptions: [{}],
	meta: {
		type: "suggestion",
		fixable: "code",
		docs: {
			description:
				"Forbid decorative / section-marker comments (e.g. =====, #region, ===text===), in both // and /* */ forms.",
			url: "https://github.com/cyberash-dev/eslint-plugin-comment-policy#no-decorative-comment",
		},
		schema,
		messages: {
			decorativeComment: "decorative / section-marker comment",
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
					for (const comment of block.comments) {
						const rawText = sourceCode.getText(comment);
						if (comment.type === "Line") {
							const content = strippedLine(rawText);
							if (
								!isDecorativeLine(content) ||
								hasProtectedToken(rawText, detect)
							) {
								continue;
							}
							const line = comment.loc.start.line;
							context.report({
								loc: comment.loc,
								messageId: "decorativeComment",
								fix: block.fullLine
									? (fixer) =>
											fixer.removeRange([
												lineIndex.lineStart(line),
												lineIndex.lineEnd(line),
											])
									: null,
							});
							continue;
						}
						/* A block comment is inspected line by line so a decorative
						   marker is caught in either comment form. Excising one line
						   out of a block comment is unsafe, so these are report-only. */
						const lines = rawText.split("\n");
						lines.forEach((rawLine, i) => {
							const content = strippedLine(rawLine);
							if (
								!isDecorativeLine(content) ||
								hasProtectedToken(rawLine, detect)
							) {
								return;
							}
							const line = comment.loc.start.line + i;
							context.report({
								loc: lineLoc(line, rawLine),
								messageId: "decorativeComment",
							});
						});
					}
				}
			},
		};
	},
};

export default rule;
