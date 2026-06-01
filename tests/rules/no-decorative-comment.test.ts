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
		{ code: "/* диапазон 5–10 строк, см. PAY-123 */\nconst x = 1;\n" },
		{ code: "/* commit then push — иначе rebase упадёт */\nconst x = 1;\n" },
		{ code: "/* timeout │ retry: см. конфиг */\nconst x = 1;\n" },
		{ code: "/* keep ttl below provider cap */\nconst x = 1;\n" },
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
		{
			code: "/* ── Tracker-channel inbound-event handlers (gatehouse:tracker-channel) ────── */\nconst x = 1;\n",
			output: null,
			errors: [{ messageId: "decorativeComment" }],
		},
		{
			code: "/* ────────── */\nconst x = 1;\n",
			output: null,
			errors: [{ messageId: "decorativeComment" }],
		},
		{
			code: "/* ══════ Section ══════ */\nconst x = 1;\n",
			output: null,
			errors: [{ messageId: "decorativeComment" }],
		},
		{
			code: "/* ———————— */\nconst x = 1;\n",
			output: null,
			errors: [{ messageId: "decorativeComment" }],
		},
		{
			code: "// ~~~~~~~~\nconst x = 1;\n",
			output: "const x = 1;\n",
			errors: [{ messageId: "decorativeComment" }],
		},
	],
});
