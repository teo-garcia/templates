import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  assertHealthPayload,
  normalizeBaseUrl,
  readJson,
  request,
  runChecks,
  waitForApplication,
} from '../shared.mjs'

const healthyResponse = () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  version: 'conformance',
})

const loadPlaywright = (workspace) => {
  const require = createRequire(path.join(workspace, 'package.json'))

  try {
    return require('@playwright/test')
  } catch (error) {
    throw new Error(
      `@playwright/test must be installed in ${workspace}: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

const assertHomeShell = async (page) => {
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' })
  assert.equal(response?.status(), 200)
  await page.locator('main').waitFor({ state: 'visible' })
  assert.match(await page.title(), /\|\s*Home$/)
}

export const runWebConformance = async (baseUrlValue, workspaceValue = process.cwd()) => {
  const baseUrl = normalizeBaseUrl(baseUrlValue)
  const workspace = path.resolve(workspaceValue)
  const { chromium } = loadPlaywright(workspace)

  await waitForApplication(baseUrl, '/api/health')

  const healthResponse = await request(baseUrl, '/api/health')
  assert.equal(healthResponse.status, 200)
  assertHealthPayload(await readJson(healthResponse, { requireContentType: false }), {
    checksOptional: true,
  })

  const browser = await chromium.launch({ headless: true })

  try {
    await runChecks([
      [
        'application shell and resolved health',
        async () => {
          const page = await browser.newPage({ baseURL: baseUrl })
          await page.route('**/api/health', async (route) => {
            await new Promise((resolve) => setTimeout(resolve, 750))
            await route.fulfill({ json: healthyResponse(), status: 200 })
          })

          await assertHomeShell(page)
          const status = page.getByRole('status')
          await status.waitFor({ state: 'visible' })
          assert.match((await status.textContent()) ?? '', /CHECKING/)
          await page.waitForFunction(
            () => document.querySelector('[role="status"]')?.textContent?.includes('OK'),
            undefined,
            { timeout: 10_000 }
          )
          await page.close()
        },
      ],
      [
        'unreachable health state',
        async () => {
          const page = await browser.newPage({ baseURL: baseUrl })
          await page.route('**/api/health', (route) =>
            route.fulfill({ json: { message: 'unavailable' }, status: 503 })
          )

          await assertHomeShell(page)
          await page.waitForFunction(
            () =>
              document
                .querySelector('[role="status"]')
                ?.textContent?.includes('UNREACHABLE'),
            undefined,
            { timeout: 10_000 }
          )
          await page.close()
        },
      ],
    ])
  } finally {
    await browser.close()
  }
}

const main = async () => {
  const baseUrl = process.env.INPUT_BASE_URL || process.argv[2]
  assert.ok(baseUrl, 'provide INPUT_BASE_URL or a base URL argument')
  await runWebConformance(baseUrl, process.env.GITHUB_WORKSPACE || process.cwd())
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
