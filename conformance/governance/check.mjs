import { readFileSync } from 'node:fs'

const governance = readFileSync(new URL('../../GOVERNANCE.md', import.meta.url), 'utf8')
const today = process.env.GOVERNANCE_DATE ?? new Date().toISOString().slice(0, 10)
const riskRows = governance.split('\n').filter((line) => line.includes('GHSA-'))
const expired = []

for (const row of riskRows) {
  const match = row.match(/through `(\d{4}-\d{2}-\d{2})`/)

  if (!match) {
    throw new Error(`Accepted-risk row has no review deadline: ${row}`)
  }

  if (match[1] < today) {
    expired.push(`${match[1]}: ${row.split('|')[1].trim()}`)
  }
}

if (expired.length > 0) {
  throw new Error(`Expired accepted risk:\n${expired.join('\n')}`)
}

console.log(`Governance deadlines valid (${riskRows.length} accepted risks checked)`)
