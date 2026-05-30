import { SDD_PROTECTED_PATTERNS } from "../../src/lib/sdd-patterns";
import { getRule, ruleTester } from "../rule-tester";

const rule = getRule("no-decorative-comment");
const sdd = [...SDD_PROTECTED_PATTERNS];

ruleTester.run("no-decorative-comment", rule, {
	valid: [
		{ code: "// a real note\nconst x = 1;\n" },
		{
			code: "// ===== gatehouse:driver:DLT-025 =====\nconst x = 1;\n",
			options: [{ protectedPatterns: sdd }],
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
