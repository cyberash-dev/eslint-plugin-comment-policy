import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { hasProtectedToken } from "./protected";

export interface CommentBlock {
	kind: "line" | "block";
	start: number;
	end: number;
	fullLine: boolean;
	raw: string;
	startLine: number;
	endLine: number;
	lineCount: number;
	hasProtected: boolean;
	comments: readonly TSESTree.Comment[];
}

export function lineStarts(text: string): number[] {
	const starts = [0];
	for (let i = 0; i < text.length; i++) {
		if (text.charCodeAt(i) === 10) {
			starts.push(i + 1);
		}
	}
	return starts;
}

export interface LineIndex {
	lineStart(lineNo: number): number;
	lineEnd(lineNo: number): number;
}

export function makeLineIndex(text: string): LineIndex {
	const starts = lineStarts(text);
	return {
		lineStart: (lineNo) => starts[lineNo - 1],
		lineEnd: (lineNo) =>
			lineNo < starts.length ? starts[lineNo] : text.length,
	};
}

function onlyWhitespaceNoBlank(between: string): boolean {
	return /^[ \t]*\r?\n[ \t]*$/.test(between);
}

interface Pending {
	kind: "line" | "block";
	start: number;
	end: number;
	fullLine: boolean;
	comments: TSESTree.Comment[];
}

/* Groups consecutive full-line `//` comments separated only by whitespace (no
   blank line) into one logical block. Comments come straight from the ESLint
   parse, so no second parser is needed. */
export function commentBlocks(
	sourceCode: TSESLint.SourceCode,
	detect: readonly RegExp[],
): CommentBlock[] {
	const text = sourceCode.text;
	const isFullLine = (c: TSESTree.Comment): boolean => {
		const lineText = sourceCode.lines[c.loc.start.line - 1] ?? "";
		return /^\s*$/.test(lineText.slice(0, c.loc.start.column));
	};

	const blocks: CommentBlock[] = [];
	let cur: Pending | null = null;
	for (const c of sourceCode.getAllComments()) {
		const kind: "line" | "block" = c.type === "Line" ? "line" : "block";
		const fullLine = isFullLine(c);
		const mergeable =
			cur !== null &&
			cur.kind === "line" &&
			kind === "line" &&
			cur.fullLine &&
			fullLine &&
			onlyWhitespaceNoBlank(text.slice(cur.end, c.range[0]));
		if (mergeable && cur) {
			cur.end = c.range[1];
			cur.comments.push(c);
			continue;
		}
		if (cur) {
			blocks.push(finalize(cur, text, detect));
		}
		cur = {
			kind,
			start: c.range[0],
			end: c.range[1],
			fullLine,
			comments: [c],
		};
	}
	if (cur) {
		blocks.push(finalize(cur, text, detect));
	}
	return blocks;
}

function finalize(
	b: Pending,
	text: string,
	detect: readonly RegExp[],
): CommentBlock {
	const raw = text.slice(b.start, b.end);
	const startLine = b.comments[0].loc.start.line;
	const endLine = b.comments[b.comments.length - 1].loc.end.line;
	return {
		kind: b.kind,
		start: b.start,
		end: b.end,
		fullLine: b.fullLine,
		raw,
		startLine,
		endLine,
		lineCount: endLine - startLine + 1,
		hasProtected: hasProtectedToken(raw, detect),
		comments: b.comments,
	};
}

export function blockLoc(block: CommentBlock): TSESTree.SourceLocation {
	return {
		start: block.comments[0].loc.start,
		end: block.comments[block.comments.length - 1].loc.end,
	};
}
