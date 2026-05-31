import { getRule, ruleTester } from "../rule-tester";

const rule = getRule("no-consecutive-comments");
const protectedPatterns = ["@keep"];

ruleTester.run("no-consecutive-comments", rule, {
	valid: [
		{ code: "// a real note\nconst x = 1;\n" },
		{ code: "// a\nconst x = 1;\n// b\nconst y = 2;\n" },
		{ code: "const x = 1; // a\nconst y = 2; // b\n" },
		{
			code: "// @keep one\n// @keep two\nconst x = 1;\n",
			options: [{ protectedPatterns }],
		},
		{
			code: "// a\n// b\nconst x = 1;\n",
			options: [{ types: ["block"] }],
		},
		{
			code: "// a\n// b\nconst x = 1;\n",
			options: [{ max: 2 }],
		},
		{
			code: "// a\n\n// b\nconst x = 1;\n",
			options: [{ skipBlankLines: false }],
		},
		{
			code: "// a\n/* x */\n// b\nconst x = 1;\n",
			options: [{ types: ["line"] }],
		},
	],
	invalid: [
		{
			code: "// a\n// b\nconst x = 1;\n",
			errors: [
				{ messageId: "consecutiveComments", data: { count: 2, max: 1 } },
			],
		},
		{
			code: "// a\n\n// b\nconst x = 1;\n",
			errors: [
				{ messageId: "consecutiveComments", data: { count: 2, max: 1 } },
			],
		},
		{
			code: "/* a */\n// b\nconst x = 1;\n",
			errors: [
				{ messageId: "consecutiveComments", data: { count: 2, max: 1 } },
			],
		},
		{
			code: "/* a\n   b */\n// c\nconst x = 1;\n",
			errors: [
				{ messageId: "consecutiveComments", data: { count: 2, max: 1 } },
			],
		},
		{
			code: "// a\n// b\n// c\nconst x = 1;\n",
			errors: [
				{ messageId: "consecutiveComments", data: { count: 3, max: 1 } },
			],
		},
	],
});
