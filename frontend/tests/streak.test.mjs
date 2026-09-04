import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getExpiredStreakCutoffDate,
  getStreakDateKey,
  resetExpiredStreak,
} from '../lib/streak.ts'

test('uses Europe/Istanbul calendar-day boundaries', () => {
  assert.equal(getStreakDateKey(new Date('2026-09-03T20:59:59Z')), '2026-09-03')
  assert.equal(getStreakDateKey(new Date('2026-09-03T21:00:00Z')), '2026-09-04')
})

test('expires dates older than yesterday, not yesterday itself', () => {
  const now = new Date('2026-09-04T09:00:00Z')
  assert.equal(getExpiredStreakCutoffDate(now), '2026-09-03')
})

test('persists zero only for rows with a last study date before yesterday', async () => {
  const calls = []
  const client = {
    from(table) {
      calls.push(['from', table])
      return {
        update(values) {
          calls.push(['update', values])
          return {
            async lt(column, value) {
              calls.push(['lt', column, value])
              return { error: null }
            },
          }
        },
      }
    },
  }

  const error = await resetExpiredStreak(client, new Date('2026-09-04T09:00:00Z'))

  assert.equal(error, null)
  assert.deepEqual(calls, [
    ['from', 'stats'],
    ['update', { streak: 0 }],
    ['lt', 'son_calisma', '2026-09-03'],
  ])
})
