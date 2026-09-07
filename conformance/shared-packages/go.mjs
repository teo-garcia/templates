import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const consumerRoot = path.join(root, 'gin-template-monolith')
const modules = [
  [
    'github.com/teo-garcia/golangci-config-shared',
    path.join(root, 'golangci-config-shared'),
  ],
  [
    'github.com/teo-garcia/gotest-config-shared',
    path.join(root, 'gotest-config-shared'),
  ],
]

function run(command, args, cwd, options = {}) {
  return execFileSync(command, args, {
    cwd,
    env: options.env ?? process.env,
    stdio: options.stdio ?? 'inherit',
  })
}

function copyTrackedFiles(repository, destination) {
  const files = run('git', ['ls-files', '-z'], repository, {
    stdio: ['ignore', 'pipe', 'inherit'],
  })
    .toString('utf8')
    .split('\0')
    .filter(Boolean)

  for (const file of files) {
    const target = path.join(destination, file)
    mkdirSync(path.dirname(target), { recursive: true })
    copyFileSync(path.join(repository, file), target)
  }
}

const consumerModule = readFileSync(path.join(consumerRoot, 'go.mod'), 'utf8')
for (const [module] of modules) {
  assert.ok(
    consumerModule.includes(module),
    `gin-template-monolith must declare ${module}`
  )
}

const lintVersionPattern = /^GOLANGCI_LINT_VERSION \?= (v\d+\.\d+\.\d+)$/m
const sharedLintMakefile = readFileSync(
  path.join(root, 'golangci-config-shared', 'Makefile'),
  'utf8'
)
const consumerMakefile = readFileSync(
  path.join(consumerRoot, 'Makefile'),
  'utf8'
)
const consumerWorkflow = readFileSync(
  path.join(consumerRoot, '.github', 'workflows', 'ci.yml'),
  'utf8'
)
const sharedLintVersion = sharedLintMakefile.match(lintVersionPattern)?.[1]
const consumerLintVersion = consumerMakefile.match(lintVersionPattern)?.[1]
const workflowLintVersion = consumerWorkflow.match(
  /^\s+GOLANGCI_LINT_VERSION: (v\d+\.\d+\.\d+)$/m
)?.[1]
assert.ok(sharedLintVersion, 'golangci-config-shared must pin golangci-lint')
assert.equal(
  consumerLintVersion,
  sharedLintVersion,
  'gin-template-monolith must use the golangci-config-shared linter version'
)
assert.equal(
  workflowLintVersion,
  sharedLintVersion,
  'gin-template-monolith CI must use the golangci-config-shared linter version'
)

const tempRoot = mkdtempSync(path.join(tmpdir(), 'templates-go-consumer-'))

try {
  const consumer = path.join(tempRoot, 'consumer')
  copyTrackedFiles(consumerRoot, consumer)

  for (const [module, source] of modules) {
    run('go', ['mod', 'edit', `-replace=${module}=${source}`], consumer)
  }

  run('go', ['mod', 'tidy'], consumer)
  run('make', ['check'], consumer, {
    env: {
      ...process.env,
      GOCACHE: path.join(tempRoot, 'go-build-cache'),
      GOLANGCI_LINT_CACHE: path.join(tempRoot, 'golangci-lint-cache'),
    },
  })

  console.log('Go shared packages passed in gin-template-monolith')
} finally {
  rmSync(tempRoot, { force: true, recursive: true })
}
