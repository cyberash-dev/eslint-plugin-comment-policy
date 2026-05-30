import { getRule, ruleTester } from "../rule-tester";

const rule = getRule("no-comment-code-snippet");
const protectedPatterns = ["@keep", "\\bISSUE-\\d+\\b"];

ruleTester.run("no-comment-code-snippet", rule, {
	valid: [
		{ code: "// import x from 'y';\nconst z = 1;\n" },
		{
			code: "// @keep\n// import x from 'y';\n// export default x;\nconst z = 1;\n",
			options: [{ protectedPatterns }],
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
