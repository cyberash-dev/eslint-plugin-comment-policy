import type { JSONSchema, TSESLint } from "@typescript-eslint/utils";

import {
	type CommentBlock,
	blockLoc,
	commentBlocks,
	makeLineIndex,
} from "../lib/comment-blocks";
import { compileProtected, strippedLine } from "../lib/protected";

const CODEISH = [
	/^(?:import|export|const|let|var|function|class|return|await|async|if|for|while|switch)\b/,
	/=>/,
	/^[\w.$]+\([^)]*\)\s*;?$/,
	/^[}{]/,
	/;\s*$/,
];

function isCodeish(content: string): boolean {
	return content.length > 0 && CODEISH.some((re) => re.test(content));
}

interface SnippetInfo {
	isSnippet: boolean;
	pure: boolean;
}

function snippetInfo(block: CommentBlock): SnippetInfo {
	if (block.hasProtected) {
		return { isSnippet: false, pure: false };
	}
	const nonEmpty = block.raw
		.split("\n")
		.map(strippedLine)
		.filter((c) => c.length > 0);
	const codeish = nonEmpty.filter(isCodeish);
	return {
		isSnippet: codeish.length >= 2,
		pure: nonEmpty.length >= 2 && codeish.length === nonEmpty.length,
	};
}

interface SnippetOptions {
	protectedPatterns?: string[];
}

type Options = readonly [SnippetOptions?];
type MessageIds = "codeSnippet";

const schema: JSONSchema.JSONSchema4[] = [
	{
		type: "object",
		properties: {
			protectedPatterns: { type: "array", items: { type: "string" } },
		},
		additionalProperties: false,
	},
];

const rule: TSESLint.RuleModule<MessageIds, Options> = {
	defaultOptions: [{}],
	meta: {
		type: "suggestion",
		fixable: "code",
		docs: {
			description:
				"Forbid code snippets (usage examples) inside comments; auto-removable only when the block is entirely code.",
			url: "https://github.com/cyberash-dev/eslint-plugin-comment-policy#no-comment-code-snippet",
		},
		schema,
		messages: {
			codeSnippet: "code snippet inside comment (usage example)",
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
					const info = snippetInfo(block);
					if (!info.isSnippet) {
						continue;
					}
					const deletable = info.pure && block.fullLine;
					context.report({
						loc: blockLoc(block),
						messageId: "codeSnippet",
						fix: deletable
							? (fixer) =>
									fixer.removeRange([
										lineIndex.lineStart(block.startLine),
										lineIndex.lineEnd(block.endLine),
									])
							: null,
					});
				}
			},
		};
	},
};

export default rule;
