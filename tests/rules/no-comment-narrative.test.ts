import { SDD_PROTECTED_PATTERNS } from "../../src/lib/sdd-patterns";
import { getRule, ruleTester } from "../rule-tester";

const rule = getRule("no-comment-narrative");
const sdd = [...SDD_PROTECTED_PATTERNS];

ruleTester.run("no-comment-narrative", rule, {
	valid: [
		{ code: "/* a plain note */\nconst x = 1;\n" },
		{
			code: "// renamed from Foo; see gatehouse:driver:DLT-025\nconst x = 1;\n",
			options: [{ protectedPatterns: sdd }],
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
			code: "// renamed from Foo; see gatehouse:driver:DLT-025\nconst x = 1;\n",
			errors: [{ messageId: "changeNarrative" }],
		},
	],
});
