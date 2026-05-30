import { type Linter, type Rule, RuleTester } from "eslint";
import tseslint from "typescript-eslint";

import plugin from "../src/index";

export const ruleTester = new RuleTester({
	languageOptions: {
		parser: tseslint.parser as unknown as Linter.Parser,
		ecmaVersion: "latest",
		sourceType: "module",
	},
});

export type RuleName =
	| "max-comment-lines"
	| "no-comment-narrative"
	| "no-comment-code-snippet"
	| "no-decorative-comment"
	| "no-line-comment";

export function getRule(name: RuleName): Rule.RuleModule {
	return plugin.rules?.[name] as unknown as Rule.RuleModule;
}
