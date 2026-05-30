export interface CompiledProtected {
	detect: RegExp[];
	strip: RegExp[];
}

/* `detect` is non-global so repeated `.test()` is stateless; `strip` keeps the
   authored order (global) so a longer marker is consumed before a shorter one
   that is a prefix of it. */
export function compileProtected(
	patterns: readonly string[],
): CompiledProtected {
	return {
		detect: patterns.map((source) => new RegExp(source)),
		strip: patterns.map((source) => new RegExp(source, "g")),
	};
}

export function hasProtectedToken(
	text: string,
	detect: readonly RegExp[],
): boolean {
	return detect.some((re) => re.test(text));
}

export function strippedLine(rawLine: string): string {
	return rawLine
		.replace(/^\s*\/\//, "")
		.replace(/^\s*\/\*+/, "")
		.replace(/\*+\/\s*$/, "")
		.replace(/^\s*\*/, "")
		.trim();
}

/* After the configured protected markers are stripped, a "prose line" still has
   a real word (>=3 letters); pure marker/anchor lines are not prose, so a block
   may carry many of them without tripping the length cap. */
export function isProseLine(
	rawLine: string,
	strip: readonly RegExp[],
): boolean {
	let content = strippedLine(rawLine);
	for (const re of strip) {
		content = content.replace(re, " ");
	}
	return /[A-Za-z]{3,}/.test(content);
}
