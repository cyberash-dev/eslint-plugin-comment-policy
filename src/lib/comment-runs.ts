import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { onlyWhitespaceNoBlank } from "./comment-blocks";
import { hasProtectedToken } from "./protected";

export interface CommentRun {
	comments: readonly TSESTree.Comment[];
	loc: TSESTree.SourceLocation;
}

interface RunOptions {
	types: ReadonlySet<"line" | "block">;
	skipBlankLines: boolean;
	detect: readonly RegExp[];
}

/* A run is a maximal sequence of full-line comments of an enabled kind with only
   whitespace between them (a single newline when `skipBlankLines` is off). Code,
   or a comment of a non-enabled kind, between two comments breaks the run. */
export function commentRuns(
	sourceCode: TSESLint.SourceCode,
	options: RunOptions,
): CommentRun[] {
	const text = sourceCode.text;
	const isFullLine = (c: TSESTree.Comment): boolean => {
		const lineText = sourceCode.lines[c.loc.start.line - 1] ?? "";
		return /^\s*$/.test(lineText.slice(0, c.loc.start.column));
	};
	const isCounted = (c: TSESTree.Comment): boolean => {
		const kind: "line" | "block" = c.type === "Line" ? "line" : "block";
		return (
			options.types.has(kind) &&
			isFullLine(c) &&
			!hasProtectedToken(sourceCode.getText(c), options.detect)
		);
	};
	const isAdjacent = (
		prev: TSESTree.Comment,
		curr: TSESTree.Comment,
	): boolean => {
		const between = text.slice(prev.range[1], curr.range[0]);
		return options.skipBlankLines
			? /^\s*$/.test(between)
			: onlyWhitespaceNoBlank(between);
	};

	const runs: CommentRun[] = [];
	let current: TSESTree.Comment[] = [];
	const flush = (): void => {
		if (current.length === 0) {
			return;
		}
		runs.push({
			comments: current,
			loc: {
				start: current[0].loc.start,
				end: current[current.length - 1].loc.end,
			},
		});
		current = [];
	};

	for (const c of sourceCode.getAllComments()) {
		if (!isCounted(c)) {
			flush();
			continue;
		}
		if (current.length > 0 && !isAdjacent(current[current.length - 1], c)) {
			flush();
		}
		current.push(c);
	}
	flush();
	return runs;
}
