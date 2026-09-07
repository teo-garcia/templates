import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const consumerRoot = path.join(root, 'next-template-fullstack')
const packages = [
  ['eslint-config-shared', '@teo-garcia/eslint-config-shared'],
  ['prettier-config-shared', '@teo-garcia/prettier-config-shared'],
  ['tsconfig-shared', '@teo-garcia/tsconfig-shared'],
  ['vitest-config-shared', '@teo-garcia/vitest-config-shared'],
]

function run(command, args, cwd, options = {}) {
  return execFileSync(command, args, {
    cwd,
    env: { ...process.env, CI: 'true', HUSKY: '0' },
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

const consumerPackage = JSON.parse(
  readFileSync(path.join(consumerRoot, 'package.json'), 'utf8')
)

for (const [, packageName] of packages) {
  assert.ok(
    consumerPackage.devDependencies?.[packageName],
    `next-template-fullstack must declare ${packageName}`
  )
}

const tempRoot = mkdtempSync(path.join(tmpdir(), 'templates-node-consumer-'))

try {
  const consumer = path.join(tempRoot, 'consumer')
  const tarballs = new Map()

  copyTrackedFiles(consumerRoot, consumer)

  for (const [directory, packageName] of packages) {
    const packageRoot = path.join(root, directory)
    const output = path.join(tempRoot, directory)
    mkdirSync(output)
    run(
      'pnpm',
      ['--config.ignore-scripts=true', 'pack', '--pack-destination', output],
      packageRoot
    )
    const packed = readdirSync(output).filter((file) => file.endsWith('.tgz'))
    assert.equal(
      packed.length,
      1,
      `${directory} must produce exactly one tarball`
    )
    tarballs.set(packageName, path.join(output, packed[0]))
  }

  const packageJsonPath = path.join(consumer, 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

  for (const [packageName, tarball] of tarballs) {
    packageJson.devDependencies[packageName] = `file:${tarball}`
  }

  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
  run('pnpm', ['install', '--no-frozen-lockfile'], consumer)
  if (process.env.CI) {
    run(
      'pnpm',
      ['exec', 'playwright', 'install', '--with-deps', 'chromium'],
      consumer
    )
  }
  run('pnpm', ['check'], consumer)

  console.log('Node shared packages passed in next-template-fullstack')
} finally {
  rmSync(tempRoot, { force: true, recursive: true })
}
