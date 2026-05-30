import { getRule, ruleTester } from "../rule-tester";

const rule = getRule("no-line-comment");

ruleTester.run("no-line-comment", rule, {
	valid: [
		{ code: "/* a note */\nconst x = 1;\n" },
		{ code: "/**\n * a note\n */\nconst x = 1;\n" },
		{ code: "/*\n * alpha\n * beta\n */\nconst x = 1;\n" },
	],
	invalid: [
		{
			code: "// hello world\nconst x = 1;\n",
			output: "/* hello world */\nconst x = 1;\n",
			errors: [{ messageId: "lineComment" }],
		},
		{
			code: "// alpha\n// beta\nconst x = 1;\n",
			output: "/*\n * alpha\n * beta\n */\nconst x = 1;\n",
			errors: [{ messageId: "lineComment" }],
		},
		{
			code: "const x = 1; // note\n",
			output: "const x = 1; /* note */\n",
			errors: [{ messageId: "lineComment" }],
		},
		{
			code: "\t// a\n\t// b\nconst x = 1;\n",
			output: "\t/*\n\t * a\n\t * b\n\t */\nconst x = 1;\n",
			errors: [{ messageId: "lineComment" }],
		},
		{
			code: "// see foo */ bar\nconst x = 1;\n",
			output: null,
			errors: [{ messageId: "lineComment" }],
		},
		{
			code: "// =====\n// real note\nconst x = 1;\n",
			output: "/* real note */\nconst x = 1;\n",
			errors: [{ messageId: "lineComment" }],
		},
		{
			code: "// =====\nconst x = 1;\n",
			output: "const x = 1;\n",
			errors: [{ messageId: "lineComment" }],
		},
	],
});
