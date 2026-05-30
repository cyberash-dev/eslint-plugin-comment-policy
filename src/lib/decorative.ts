const DECORATIVE = [
	/^[=*#_-]{3,}$/,
	/^#?\s*(?:region|endregion)\b/i,
	/^[=*#_-]{2,}.*[=*#_-]{2,}$/,
];

export function isDecorativeLine(content: string): boolean {
	return content.length > 0 && DECORATIVE.some((re) => re.test(content));
}
