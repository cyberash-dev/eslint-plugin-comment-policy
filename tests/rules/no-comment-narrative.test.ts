import { getRule, ruleTester } from "../rule-tester";

const rule = getRule("no-comment-narrative");
const protectedPatterns = ["@keep", "\\bISSUE-\\d+\\b"];

ruleTester.run("no-comment-narrative", rule, {
	valid: [
		{ code: "/* a plain note */\nconst x = 1;\n" },
		{
			code: "// renamed from Foo; see ISSUE-25\nconst x = 1;\n",
			options: [{ protectedPatterns }],
		},
	],
	invalid: [
		{
			code: "// renamed from Foo\nconst x = 1;\n",
			errors: [{ messageId: "changeNarrative" }],
		},
		{
			code: "// 2025-01-31 shipped\nconst x = 1;\n",
			errors: [{ messageId: "changeNarrative" }],
		},
		{
			code: "// bumped to v1.2 today\nconst x = 1;\n",
			errors: [{ messageId: "changeNarrative" }],
		},
		{
			code: "// renamed from Foo; see ISSUE-25\nconst x = 1;\n",
			errors: [{ messageId: "changeNarrative" }],
		},
	],
});
