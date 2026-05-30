import "./rules/max-comment-lines.test";
import "./rules/no-comment-narrative.test";
import "./rules/no-comment-code-snippet.test";
import "./rules/no-decorative-comment.test";
import "./rules/no-line-comment.test";

process.stdout.write(
	"eslint-plugin-comment-policy: all RuleTester suites passed.\n",
);
