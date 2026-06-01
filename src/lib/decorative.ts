const DIV = "=*#_~\\-\\u2013\\u2014\\u2500-\\u257F";
const DECORATIVE = [
	new RegExp(`^[${DIV}]{3,}$`),
	/^#?\s*(?:region|endregion)\b/i,
	new RegExp(`^[${DIV}]{2,}.*[${DIV}]{2,}$`),
];

export function isDecorativeLine(content: string): boolean {
	return content.length > 0 && DECORATIVE.some((re) => re.test(content));
}
