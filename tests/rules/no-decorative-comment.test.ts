import { getRule, ruleTester } from "../rule-tester";

const rule = getRule("no-decorative-comment");
const protectedPatterns = ["@keep", "\\bISSUE-\\d+\\b"];

ruleTester.run("no-decorative-comment", rule, {
	valid: [
		{ code: "// a real note\nconst x = 1;\n" },
		{
			code: "// ===== ISSUE-25 =====\nconst x = 1;\n",
			options: [{ protectedPatterns }],
		},
	],
	invalid: [
		{
			code: "// =====\nconst x = 1;\n",
			output: "const x = 1;\n",
			errors: [{ messageId: "decorativeComment" }],
		},
		{
			code: "// ===text===\nconst x = 1;\n",
			output: "const x = 1;\n",
			errors: [{ messageId: "decorativeComment" }],
		},
		{
			code: "// #region Foo\nconst x = 1;\n",
			output: "const x = 1;\n",
			errors: [{ messageId: "decorativeComment" }],
		},
		{
			code: "/* ===== */\nconst x = 1;\n",
			output: null,
			errors: [{ messageId: "decorativeComment" }],
		},
	],
});
