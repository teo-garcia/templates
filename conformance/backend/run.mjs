import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'

import {
  assertHealthPayload,
  assertTimestamp,
  normalizeBaseUrl,
  readJson,
  request,
  runChecks,
  waitForApplication,
} from '../shared.mjs'

const requestId = '00000000-0000-4000-8000-000000000001'
const rateLimitHeaders = [
  'x-ratelimit-limit',
  'x-ratelimit-remaining',
  'x-ratelimit-reset',
]

const assertNoRateLimitHeaders = (response) => {
  for (const header of rateLimitHeaders) {
    assert.equal(response.headers.has(header), false, `${response.url} must not include ${header}`)
  }
}

const assertRequestMetadata = (response, body, { method, path, statusCode }) => {
  assert.equal(body.statusCode, statusCode)
  assert.equal(body.method, method)
  assert.equal(body.path, path)
  assertTimestamp(body.timestamp)
  assert.equal(response.headers.get('x-request-id'), requestId)
  assert.equal(body.meta?.requestId, requestId)
}

const assertSuccessEnvelope = (response, body, expected) => {
  assert.equal(body.success, true)
  assert.ok('data' in body, 'success envelope must include data')
  assertRequestMetadata(response, body, expected)
  assert.equal(typeof body.meta?.version, 'string')
  assert.equal(typeof body.meta?.duration, 'number')
}

const assertErrorEnvelope = (response, body, expected) => {
  assert.equal(body.success, false)
  assert.ok(typeof body.message === 'string' || Array.isArray(body.message))
  assert.equal(typeof body.error, 'string')
  assertRequestMetadata(response, body, expected)
}

const assertRateLimitHeaders = (response) => {
  for (const header of rateLimitHeaders.slice(0, 2)) {
    const value = response.headers.get(header)
    assert.match(value ?? '', /^\d+$/, `${response.url} must include numeric ${header}`)
  }

  const reset = response.headers.get('x-ratelimit-reset')
  assert.ok(
    reset !== null && Number.isFinite(Number(reset)) && Number(reset) >= 0,
    `${response.url} must include numeric x-ratelimit-reset`
  )
}

const responseSchemaSignalsEnvelope = (schema) => {
  const serialized = JSON.stringify(schema)
  return (
    /SuccessEnvelope/i.test(serialized) ||
    (serialized.includes('"success"') && serialized.includes('"data"'))
  )
}

export const runBackendConformance = async (baseUrlValue) => {
  const baseUrl = normalizeBaseUrl(baseUrlValue)
  await waitForApplication(baseUrl)

  let readiness

  await runChecks([
    [
      'liveness contract',
      async () => {
        const response = await request(baseUrl, '/health/live')
        assert.equal(response.status, 200)
        assertNoRateLimitHeaders(response)
        assertHealthPayload(await readJson(response), { liveness: true })
      },
    ],
    [
      'readiness contract',
      async () => {
        const response = await request(baseUrl, '/health/ready')
        readiness = await readJson(response)
        assertHealthPayload(readiness)
        assert.equal(response.status, readiness.status === 'ok' ? 200 : 503)
        assertNoRateLimitHeaders(response)
      },
    ],
    [
      'aggregate health agrees with readiness',
      async () => {
        const response = await request(baseUrl, '/health')
        const body = await readJson(response)
        assertHealthPayload(body)
        assert.equal(response.status, body.status === 'ok' ? 200 : 503)
        assert.equal(body.status, readiness.status)
        assert.deepEqual(body.checks, readiness.checks)
        assertNoRateLimitHeaders(response)
      },
    ],
    [
      'documentation routes',
      async () => {
        const response = await request(baseUrl, '/docs')
        assert.equal(response.status, 200)
        assert.match(response.headers.get('content-type') ?? '', /text\/html/i)
        assert.match(await response.text(), /openapi|swagger/i)
        assertNoRateLimitHeaders(response)
      },
    ],
    [
      'OpenAPI success envelope',
      async () => {
        const response = await request(baseUrl, '/openapi.json')
        assert.equal(response.status, 200)
        const body = await readJson(response)
        assert.match(body.openapi, /^3\./)
        const operation = body.paths?.['/api/v1/tasks']?.get
        assert.ok(operation, 'OpenAPI must document GET /api/v1/tasks')
        const schema = operation.responses?.['200']?.content?.['application/json']?.schema
        assert.ok(schema, 'OpenAPI must document the task-list 200 JSON schema')
        assert.ok(
          responseSchemaSignalsEnvelope(schema),
          'OpenAPI task-list response must use the success envelope'
        )
        assertNoRateLimitHeaders(response)
      },
    ],
    [
      'success envelope and request ID',
      async () => {
        const path = '/api/v1/tasks'
        const response = await request(baseUrl, path, {
          headers: { 'x-request-id': requestId },
        })
        assert.equal(response.status, 200)
        const body = await readJson(response)
        assertSuccessEnvelope(response, body, { method: 'GET', path, statusCode: 200 })
        assertRateLimitHeaders(response)
      },
    ],
    [
      'validation error envelope',
      async () => {
        const path = '/api/v1/tasks'
        const response = await request(baseUrl, path, {
          body: '{}',
          headers: {
            'content-type': 'application/json',
            'x-request-id': requestId,
          },
          method: 'POST',
        })
        assert.ok([400, 422].includes(response.status))
        const body = await readJson(response)
        assertErrorEnvelope(response, body, {
          method: 'POST',
          path,
          statusCode: response.status,
        })
      },
    ],
    [
      'unknown-route error envelope',
      async () => {
        const path = '/__conformance__/missing'
        const response = await request(baseUrl, path, {
          headers: { 'x-request-id': requestId },
        })
        assert.equal(response.status, 404)
        const body = await readJson(response)
        assertErrorEnvelope(response, body, { method: 'GET', path, statusCode: 404 })
      },
    ],
    [
      'Prometheus metrics',
      async () => {
        const response = await request(baseUrl, '/metrics')
        assert.equal(response.status, 200)
        assert.match(response.headers.get('content-type') ?? '', /text\/plain|openmetrics/i)
        const body = await response.text()
        assert.match(body, /http_requests_total/)
        assert.match(body, /http_request_duration_seconds/)
        assertNoRateLimitHeaders(response)
      },
    ],
  ])
}

const main = async () => {
  const baseUrl = process.env.INPUT_BASE_URL || process.argv[2]
  assert.ok(baseUrl, 'provide INPUT_BASE_URL or a base URL argument')
  await runBackendConformance(baseUrl)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
