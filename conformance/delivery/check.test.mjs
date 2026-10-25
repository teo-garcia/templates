import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  assertImmutableActions,
  assertPilotConsumer,
  assertReadOnlyContainerWorkflow,
  assertReleaseWorkflow,
  assertReusableOnly,
  assertSecurityConsumer,
  assertSecurityWorkflow,
} from "./check.mjs";

test("rejects advisory-only defaults even when ignore-unfixed defaults true", () => {
  const source = readFileSync(
    new URL("../../.github/workflows/reusable-security.yml", import.meta.url),
    "utf8",
  );
  assert.doesNotThrow(() => assertSecurityWorkflow(source));
  assert.throws(() =>
    assertSecurityWorkflow(source.replace("default: true", "default: false")),
  );
});

const securityFixture = `on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  shared-security:
    with:
      fail-on-findings: true
  security:
    name: Security
    if: always()
    needs: [shared-security, npm-audit]
    steps:
      - env:
          SHARED_SECURITY_RESULT: \${{ needs.shared-security.result }}
          AUDIT_RESULT: \${{ needs.npm-audit.result }}
        run: |
          test "$SHARED_SECURITY_RESULT" = success
          test "$AUDIT_RESULT" = success
`;

test("requires scans on every PR and propagates both scanner failures", () => {
  assert.doesNotThrow(() =>
    assertSecurityConsumer(securityFixture, "fixture", "npm-audit"),
  );
  for (const source of [
    securityFixture.replace(
      "fail-on-findings: true",
      "fail-on-findings: false",
    ),
    securityFixture.replace(
      "  pull_request:\n",
      "  pull_request:\n    paths: [package.json]\n",
    ),
    securityFixture.replace("if: always()", "if: success()"),
    securityFixture.replace(
      "needs: [shared-security, npm-audit]",
      "needs: [shared-security]",
    ),
    securityFixture.replace('test "$AUDIT_RESULT" = success', "echo skipped"),
    securityFixture.replace(
      'test "$SHARED_SECURITY_RESULT" = success',
      "echo skipped",
    ),
  ]) {
    assert.throws(() => assertSecurityConsumer(source, "fixture", "npm-audit"));
  }
});

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

const releaseFixture = `on:
  workflow_call:
permissions:
  contents: read
  packages: write
  id-token: write
  attestations: write
jobs:
  publish:
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: docker/build-push-action@53b7df96c91f9c12dcc8a07bcb9ccacbed38856a # v7
        with:
          push: true
          provenance: mode=max
          sbom: true
      - uses: actions/attest@1e69f48acb82d1966a394da916b4c1698aa569d6 # v4
`;

test("accepts a tag-gated attested release workflow", () => {
  assert.doesNotThrow(() => assertReleaseWorkflow(releaseFixture));
});

test("rejects a release workflow without tag gating", () => {
  assert.throws(() =>
    assertReleaseWorkflow(
      releaseFixture.replace(
        "if: startsWith(github.ref, 'refs/tags/v')",
        "if: always()",
      ),
    ),
  );
});

test("rejects an unattested release workflow", () => {
  assert.throws(() =>
    assertReleaseWorkflow(
      releaseFixture.replace(
        "      - uses: actions/attest@1e69f48acb82d1966a394da916b4c1698aa569d6 # v4\n",
        "",
      ),
    ),
  );
});

const pilotFixture = {
  name: "Example",
  dockerSource: `permissions:
  contents: read
jobs:
  verify:
    uses: teo-garcia/templates/.github/workflows/reusable-container-verification.yml@9a0eba11237b3d7b03d58c4bb58c90c8771a2cf4 # delivery-v0.1.1
`,
  securitySource: `jobs:
  shared-security:
    permissions:
      contents: read
      security-events: write
    uses: teo-garcia/templates/.github/workflows/reusable-security.yml@9a0eba11237b3d7b03d58c4bb58c90c8771a2cf4 # delivery-v0.1.1
  ecosystem-audit:
    run: audit dependencies
`,
  releaseSource: `on:
  push:
    tags: ["v*"]
permissions:
  contents: read
jobs:
  verify:
    uses: teo-garcia/templates/.github/workflows/reusable-container-verification.yml@9a0eba11237b3d7b03d58c4bb58c90c8771a2cf4 # delivery-v0.1.1
  publish:
    needs: verify
    permissions:
      contents: read
      packages: write
      id-token: write
      attestations: write
    uses: teo-garcia/templates/.github/workflows/reusable-container-release.yml@9a0eba11237b3d7b03d58c4bb58c90c8771a2cf4 # delivery-v0.1.1
`,
  requiredLocalAudit: /audit dependencies/,
};

test("accepts an immutable thin pilot consumer", () => {
  assert.doesNotThrow(() => assertPilotConsumer(pilotFixture));
});

test("accepts a verification-only application consumer", () => {
  assert.doesNotThrow(() =>
    assertPilotConsumer({ ...pilotFixture, releaseSource: undefined }),
  );
});

test("rejects a mutable pilot workflow reference", () => {
  assert.throws(
    () =>
      assertPilotConsumer({
        ...pilotFixture,
        dockerSource: pilotFixture.dockerSource.replace(/[0-9a-f]{40}/, "main"),
      }),
    /full commit SHA/,
  );
});

test("rejects a pilot without its local ecosystem audit", () => {
  assert.throws(() =>
    assertPilotConsumer({
      ...pilotFixture,
      securitySource: pilotFixture.securitySource.replace(
        "audit dependencies",
        "echo skipped",
      ),
    }),
  );
});

test("rejects a release caller that bypasses verification", () => {
  assert.throws(() =>
    assertPilotConsumer({
      ...pilotFixture,
      releaseSource: pilotFixture.releaseSource.replace(
        "needs: verify",
        "needs: []",
      ),
    }),
  );
});

test("rejects a release caller with a mismatched policy revision", () => {
  assert.throws(
    () =>
      assertPilotConsumer({
        ...pilotFixture,
        releaseSource: pilotFixture.releaseSource.replace(
          "9a0eba11237b3d7b03d58c4bb58c90c8771a2cf4 # delivery-v0.1.1",
          "e0aa52f1d25edeac907bf1dcf2243af4d958e5e0 # delivery-v0.2.0",
        ),
      }),
    /same shared revision/,
  );
});
