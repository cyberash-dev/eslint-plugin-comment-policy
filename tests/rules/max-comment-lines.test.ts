import { getRule, ruleTester } from "../rule-tester";

const rule = getRule("max-comment-lines");
const protectedPatterns = ["@keep", "\\bISSUE-\\d+\\b"];

ruleTester.run("max-comment-lines", rule, {
	valid: [
		{ code: "// alpha\n// bravo\n// charlie\n// delta\nconst x = 1;\n" },
		{
			code: "// ISSUE-25 one\n// two\n// three\nconst x = 1;\n",
			options: [{ protectedPatterns }],
		},
		{
			code:
				"// @keep\n" +
				"// @keep\n" +
				"// @keep\n" +
				"// @keep\n" +
				"// @keep\n" +
				"// suite\nconst x = 1;\n",
			options: [{ protectedPatterns }],
		},
		{
			code: "/**\n * ISSUE-25 one\n * two\n * three\n */\nconst x = 1;\n",
			options: [{ protectedPatterns }],
		},
	],
	invalid: [
		{
			code: "// alpha\n// bravo\n// charlie\n// delta\n// echo\nconst x = 1;\n",
			errors: [{ messageId: "tooManyProse", data: { count: 5, max: 4 } }],
		},
		{
			code: "// ISSUE-25 one\n// two\n// three\n// four\nconst x = 1;\n",
			options: [{ protectedPatterns }],
			errors: [
				{ messageId: "tooManyProseAnchored", data: { count: 4, max: 3 } },
			],
		},
	],
});
