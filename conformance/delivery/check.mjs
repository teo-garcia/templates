import assert from "node:assert/strict";
import { access, constants, readFile } from "node:fs/promises";
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
  assert.equal(
    [...source.matchAll(/limit-severities-for-sarif:\s+true/g)].length,
    2,
    "security workflow must enforce severity filtering for both SARIF scans",
  );
  assert.match(source, /fail-on-severity:\s+high/);
  assert.doesNotMatch(source, /(packages|attestations|id-token):\s+write/);
};

export const assertReleaseWorkflow = (source) => {
  assertReusableOnly(source, "release workflow");
  assertImmutableActions(source, "release workflow");
  assert.match(source, /if:\s+startsWith\(github\.ref, 'refs\/tags\/v'\)/);
  assert.match(source, /contents:\s+read/);
  assert.match(source, /packages:\s+write/);
  assert.match(source, /id-token:\s+write/);
  assert.match(source, /attestations:\s+write/);
  assert.match(source, /push:\s+true/);
  assert.match(source, /provenance:\s+mode=max/);
  assert.match(source, /sbom:\s+true/);
  assert.match(source, /uses:\s+actions\/attest@[0-9a-f]{40}/);
  assert.doesNotMatch(source, /pull_request:/);
};

const sharedWorkflowReference = (source, workflow, name) => {
  const match = source.match(
    new RegExp(
      `uses:\\s+teo-garcia/templates/\\.github/workflows/${workflow}@([0-9a-f]{40})\\s+#\\s+\\S+`,
    ),
  );
  assert.ok(match, `${name} must pin ${workflow} to a full commit SHA`);
  return match[1];
};

export const assertPilotConsumer = ({
  dockerSource,
  securitySource,
  name,
  requiredDockerInput,
  requiredLocalAudit,
}) => {
  const containerPin = sharedWorkflowReference(
    dockerSource,
    "reusable-container-verification.yml",
    `${name} Docker workflow`,
  );
  const securityPin = sharedWorkflowReference(
    securitySource,
    "reusable-security.yml",
    `${name} security workflow`,
  );

  assert.equal(
    containerPin,
    securityPin,
    `${name} delivery workflows must use the same shared revision`,
  );
  assert.match(dockerSource, /permissions:\n\s{2}contents:\s+read/);
  assert.doesNotMatch(dockerSource, /^\s{4}(runs-on|steps):/m);
  assert.equal(
    [...dockerSource.matchAll(/^\s{4}uses:/gm)].length,
    1,
    `${name} Docker workflow must remain a thin reusable-workflow caller`,
  );
  assert.doesNotMatch(
    dockerSource,
    /(packages|attestations|id-token):\s+write/,
  );
  assert.match(securitySource, /security-events:\s+write/);
  assert.doesNotMatch(
    securitySource,
    /(packages|attestations|id-token):\s+write/,
  );

  if (requiredDockerInput) {
    assert.match(dockerSource, requiredDockerInput);
  }
  if (requiredLocalAudit) {
    assert.match(securitySource, requiredLocalAudit);
  }
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
const releaseSource = await readFile(
  `${root}/.github/workflows/reusable-container-release.yml`,
  "utf8",
);

assertReadOnlyContainerWorkflow(containerSource);
assertSecurityWorkflow(securitySource);
assertReleaseWorkflow(releaseSource);

const pilots = [
  {
    directory: "nest-template-monolith",
    name: "Nest",
    requiredLocalAudit: /pnpm audit --audit-level=high/,
  },
  {
    directory: "fastapi-template-monolith",
    name: "FastAPI",
    requiredLocalAudit: /pip-audit/,
  },
  {
    directory: "spring-template-monolith",
    name: "Spring",
  },
  {
    directory: "gin-template-monolith",
    name: "Gin",
    requiredDockerInput: /target:\s+production/,
    requiredLocalAudit: /govulncheck \.\/\.\.\./,
  },
];

for (const pilot of pilots) {
  const pilotRoot = `${root}/${pilot.directory}`;
  const [dockerSource, pilotSecuritySource] = await Promise.all([
    readFile(`${pilotRoot}/.github/workflows/docker-build.yml`, "utf8"),
    readFile(`${pilotRoot}/.github/workflows/security-scan.yml`, "utf8"),
    access(`${pilotRoot}/.github/scripts/container-smoke.sh`, constants.X_OK),
  ]);

  assertPilotConsumer({
    ...pilot,
    dockerSource,
    securitySource: pilotSecuritySource,
  });
}

console.log("Reusable delivery workflow and pilot consumer contracts valid");
