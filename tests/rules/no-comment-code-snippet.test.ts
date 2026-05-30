import { SDD_PROTECTED_PATTERNS } from "../../src/lib/sdd-patterns";
import { getRule, ruleTester } from "../rule-tester";

const rule = getRule("no-comment-code-snippet");
const sdd = [...SDD_PROTECTED_PATTERNS];

ruleTester.run("no-comment-code-snippet", rule, {
	valid: [
		{ code: "// import x from 'y';\nconst z = 1;\n" },
		{
			code: "// @covers gatehouse:driver:DLT-025\n// import x from 'y';\n// export default x;\nconst z = 1;\n",
			options: [{ protectedPatterns: sdd }],
		},
	],
	invalid: [
		{
			code: "//   import x from 'y';\n//   export default x;\nconst z = 1;\n",
			output: "const z = 1;\n",
			errors: [{ messageId: "codeSnippet" }],
		},
		{
			code: "// usage example below\n// foo(bar);\n// baz(qux);\nconst z = 1;\n",
			output: null,
			errors: [{ messageId: "codeSnippet" }],
		},
	],
});
