import { SDD_PROTECTED_PATTERNS } from "../../src/lib/sdd-patterns";
import { getRule, ruleTester } from "../rule-tester";

const rule = getRule("max-comment-lines");
const sdd = [...SDD_PROTECTED_PATTERNS];

ruleTester.run("max-comment-lines", rule, {
	valid: [
		{ code: "// alpha\n// bravo\n// charlie\n// delta\nconst x = 1;\n" },
		{
			code: "// gatehouse:driver:DLT-025 one\n// two\n// three\nconst x = 1;\n",
			options: [{ protectedPatterns: sdd }],
		},
		{
			code:
				"// @covers gatehouse-local-driver:INV-001\n" +
				"// @covers gatehouse-local-driver:CON-008\n" +
				"// @covers gatehouse:driver:DLT-025\n" +
				"// @covers gatehouse:driver:DLT-029\n" +
				"// @covers gatehouse:driver:CON-004\n" +
				"// suite\nconst x = 1;\n",
			options: [{ protectedPatterns: sdd }],
		},
		{
			code: "/**\n * gatehouse:driver:DLT-025 one\n * two\n * three\n */\nconst x = 1;\n",
			options: [{ protectedPatterns: sdd }],
		},
	],
	invalid: [
		{
			code: "// alpha\n// bravo\n// charlie\n// delta\n// echo\nconst x = 1;\n",
			errors: [{ messageId: "tooManyProse", data: { count: 5, max: 4 } }],
		},
		{
			code: "// gatehouse:driver:DLT-025 one\n// two\n// three\n// four\nconst x = 1;\n",
			options: [{ protectedPatterns: sdd }],
			errors: [
				{ messageId: "tooManyProseAnchored", data: { count: 4, max: 3 } },
			],
		},
	],
});
