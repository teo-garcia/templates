import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const immutableActionPattern = /uses:\s+[^\s@]+@[0-9a-f]{40}(?:\s+#\s+\S+)?$/gm;
const externalActionPattern = /uses:\s+([^\s@]+)@([^\s#]+)/gm;

export const assertImmutableActions = (source, name) => {
  const actions = [...source.matchAll(externalActionPattern)];
  assert.ok(actions.length > 0, `${name} must use at least one action`);

  for (const [, action, reference] of actions) {
    assert.match(
      reference,
      /^[0-9a-f]{40}$/,
      `${name}: ${action} must use a full commit SHA`,
    );
  }

  assert.equal(
    [...source.matchAll(immutableActionPattern)].length,
    actions.length,
    `${name} action pins must retain a human-readable version comment`,
  );
};

export const assertReusableOnly = (source, name) => {
  assert.match(
    source,
    /^on:\n\s{2}workflow_call:/m,
    `${name} must expose workflow_call`,
  );
  assert.doesNotMatch(
    source,
    /^\s{2}(push|pull_request|schedule|workflow_dispatch):/m,
  );
  assert.doesNotMatch(source, /secrets:\s+inherit/);
};

export const assertReadOnlyContainerWorkflow = (source) => {
  assertReusableOnly(source, "container workflow");
  assertImmutableActions(source, "container workflow");
  assert.match(source, /permissions:\n\s{2}contents:\s+read/);
  assert.match(source, /run:\s+test -x \.github\/scripts\/container-smoke\.sh/);
  assert.match(source, /push:\s+false/);
  assert.match(source, /load:\s+true/);
  assert.doesNotMatch(source, /(packages|attestations|id-token):\s+write/);
  assert.doesNotMatch(source, /push:\s+true/);
};

export const assertSecurityWorkflow = (source) => {
  assertReusableOnly(source, "security workflow");
  assertImmutableActions(source, "security workflow");
  assert.match(source, /security-events:\s+write/);
  assert.match(source, /severity:\s+HIGH,CRITICAL/g);
  assert.match(source, /fail-on-severity:\s+high/);
  assert.doesNotMatch(source, /(packages|attestations|id-token):\s+write/);
};

const root = fileURLToPath(new URL("../..", import.meta.url));
const containerSource = await readFile(
  `${root}/.github/workflows/reusable-container-verification.yml`,
  "utf8",
);
const securitySource = await readFile(
  `${root}/.github/workflows/reusable-security.yml`,
  "utf8",
);

assertReadOnlyContainerWorkflow(containerSource);
assertSecurityWorkflow(securitySource);

console.log("Reusable delivery workflow contracts valid");
