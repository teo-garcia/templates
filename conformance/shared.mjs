import assert from 'node:assert/strict'

export const normalizeBaseUrl = (value) => {
  assert.equal(typeof value, 'string', 'base URL must be a string')

  const url = new URL(value)
  assert.ok(
    url.protocol === 'http:' || url.protocol === 'https:',
    'base URL must use HTTP or HTTPS'
  )

  return url.href.replace(/\/$/, '')
}

export const request = async (baseUrl, path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: 'follow',
    signal: AbortSignal.timeout(10_000),
    ...options,
  })

  return response
}

export const readJson = async (response, { requireContentType = true } = {}) => {
  if (requireContentType) {
    assert.match(
      response.headers.get('content-type') ?? '',
      /application\/json/i,
      `${response.url} must return JSON`
    )
  }

  return response.json()
}

export const assertTimestamp = (value, label = 'timestamp') => {
  assert.equal(typeof value, 'string', `${label} must be a string`)
  assert.ok(Number.isFinite(Date.parse(value)), `${label} must be ISO-8601`)
}

export const assertHealthPayload = (
  body,
  { checksOptional = false, liveness = false } = {}
) => {
  assert.ok(body && typeof body === 'object', 'health body must be an object')
  assert.ok(
    ['ok', 'degraded', 'down'].includes(body.status),
    'health status must be ok, degraded, or down'
  )
  assertTimestamp(body.timestamp, 'health timestamp')
  assert.equal(typeof body.version, 'string', 'health version must be a string')
  assert.equal('success' in body, false, 'health responses must not be enveloped')

  if (liveness) {
    assert.equal(body.status, 'ok', 'liveness must report ok')
    assert.equal('checks' in body, false, 'liveness must not probe dependencies')
    return
  }

  if (checksOptional && !('checks' in body)) return

  assert.ok(body.checks && typeof body.checks === 'object', 'readiness must include checks')
  assert.ok(['up', 'down'].includes(body.checks.database), 'database check must be up or down')
  assert.ok(['up', 'down'].includes(body.checks.redis), 'redis check must be up or down')
}

export const waitForApplication = async (baseUrl, path = '/health/live') => {
  const deadline = Date.now() + 60_000
  let lastError

  while (Date.now() < deadline) {
    try {
      const response = await request(baseUrl, path)
      if (response.ok) return
      lastError = new Error(`${path} returned ${response.status}`)
    } catch (error) {
      lastError = error
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000))
  }

  throw new Error(
    `application did not become ready at ${baseUrl}${path}: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  )
}

export const runChecks = async (checks) => {
  for (const [name, check] of checks) {
    await check()
    console.log(`✓ ${name}`)
  }
}
