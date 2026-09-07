import assert from "node:assert/strict";
import { test } from "node:test";

import {
  assertImmutableActions,
  assertReadOnlyContainerWorkflow,
  assertReusableOnly,
} from "./check.mjs";

const containerFixture = `on:
  workflow_call:
permissions:
  contents: read
jobs:
  verify:
    steps:
      - uses: actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803 # v6
      - run: test -x .github/scripts/container-smoke.sh
      - uses: docker/build-push-action@53b7df96c91f9c12dcc8a07bcb9ccacbed38856a # v7
        with:
          load: true
          push: false
`;

test("accepts an immutable read-only container workflow", () => {
  assert.doesNotThrow(() => assertReadOnlyContainerWorkflow(containerFixture));
});

test("rejects a mutable action reference", () => {
  assert.throws(
    () =>
      assertImmutableActions(
        containerFixture.replace(/d234[0-9a-f]+/, "v6"),
        "fixture",
      ),
    /full commit SHA/,
  );
});

test("rejects direct event triggers", () => {
  assert.throws(
    () =>
      assertReusableOnly(
        containerFixture.replace("workflow_call:", "push:"),
        "fixture",
      ),
    /workflow_call/,
  );
});

test("rejects write-capable container verification", () => {
  assert.throws(
    () =>
      assertReadOnlyContainerWorkflow(
        containerFixture.replace(
          "contents: read",
          "contents: read\n  packages: write",
        ),
      ),
    /packages/,
  );
});

test("rejects image publication from verification", () => {
  assert.throws(
    () =>
      assertReadOnlyContainerWorkflow(
        containerFixture.replace("push: false", "push: true"),
      ),
    /push/,
  );
});
