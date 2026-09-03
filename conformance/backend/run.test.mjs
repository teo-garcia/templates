import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { after, before, test } from 'node:test'

import { runBackendConformance } from './run.mjs'

let baseUrl
let server

const requestId = '00000000-0000-4000-8000-000000000001'
const health = () => ({
  checks: { database: 'up', redis: 'up' },
  status: 'ok',
  timestamp: new Date().toISOString(),
  version: '1',
})

const json = (response, statusCode, body, headers = {}) => {
  response.writeHead(statusCode, {
    'content-type': 'application/json',
    'x-request-id': requestId,
    ...headers,
  })
  response.end(JSON.stringify(body))
}

const envelope = (request, statusCode, data) => ({
  data,
  meta: { duration: 1, requestId, version: '1' },
  method: request.method,
  path: request.url,
  statusCode,
  success: true,
  timestamp: new Date().toISOString(),
})

before(async () => {
  server = createServer((request, response) => {
    if (request.url === '/health/live') {
      json(response, 200, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1',
      })
      return
    }

    if (request.url === '/health' || request.url === '/health/ready') {
      json(response, 200, health())
      return
    }

    if (request.url === '/docs') {
      response.writeHead(200, { 'content-type': 'text/html' })
      response.end('<html>Swagger loads /openapi.json</html>')
      return
    }

    if (request.url === '/openapi.json') {
      json(response, 200, {
        openapi: '3.1.0',
        paths: {
          '/api/v1/tasks': {
            get: {
              responses: {
                200: {
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/SuccessEnvelope' },
                    },
                  },
                },
              },
            },
          },
        },
      })
      return
    }

    if (request.url === '/api/v1/tasks' && request.method === 'GET') {
      json(response, 200, envelope(request, 200, { data: [], meta: {} }), {
        'x-ratelimit-limit': '100',
        'x-ratelimit-remaining': '99',
        'x-ratelimit-reset': '1',
      })
      return
    }

    if (request.url === '/api/v1/tasks' && request.method === 'POST') {
      json(response, 422, {
        error: 'ValidationError',
        message: 'Validation failed',
        meta: { requestId },
        method: 'POST',
        path: request.url,
        statusCode: 422,
        success: false,
        timestamp: new Date().toISOString(),
      })
      return
    }

    if (request.url === '/metrics') {
      response.writeHead(200, { 'content-type': 'text/plain' })
      response.end('http_requests_total 1\nhttp_request_duration_seconds 0.1\n')
      return
    }

    json(response, 404, {
      error: 'NotFoundError',
      message: 'Resource not found',
      meta: { requestId },
      method: 'GET',
      path: request.url,
      statusCode: 404,
      success: false,
      timestamp: new Date().toISOString(),
    })
  })

  await new Promise((resolve, reject) => {
    const handleError = (error) => reject(error)
    server.once('error', handleError)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', handleError)
      resolve()
    })
  })
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  baseUrl = `http://127.0.0.1:${address.port}`
})

after(async () => {
  if (!server?.listening) return

  server.closeAllConnections()
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
})

test('accepts a backend that implements the shared contract', async () => {
  await runBackendConformance(baseUrl)
})
