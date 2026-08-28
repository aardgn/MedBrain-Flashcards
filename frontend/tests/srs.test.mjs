import assert from 'node:assert/strict'
import test from 'node:test'

import { calculateNextReview, SECONDS_PER_DAY } from '../lib/srs.ts'

const NOW = 1_700_000_000

test('Bilemedim resets every interval and reviews immediately', () => {
  for (const interval of [0, 1, 100]) {
    assert.deepEqual(calculateNextReview(interval, 'Bilemedim', NOW), {
      interval: 0,
      nextReviewAt: NOW,
    })
  }
})

test('Zordu clamps zero to one day and preserves positive intervals', () => {
  for (const [current, expected] of [[0, 1], [1, 1], [100, 100]]) {
    assert.deepEqual(calculateNextReview(current, 'Zordu', NOW), {
      interval: expected,
      nextReviewAt: NOW + expected * SECONDS_PER_DAY,
    })
  }
})

test('Kolaydı starts at three days and doubles existing intervals', () => {
  for (const [current, expected] of [[0, 3], [1, 2], [4, 8], [100, 200]]) {
    assert.deepEqual(calculateNextReview(current, 'Kolaydı', NOW), {
      interval: expected,
      nextReviewAt: NOW + expected * SECONDS_PER_DAY,
    })
  }
})

test('negative intervals retain the Python implementation behavior', () => {
  assert.deepEqual(calculateNextReview(-5, 'Zordu', NOW), {
    interval: 1,
    nextReviewAt: NOW + SECONDS_PER_DAY,
  })
  assert.deepEqual(calculateNextReview(-5, 'Kolaydı', NOW), {
    interval: -10,
    nextReviewAt: NOW - 10 * SECONDS_PER_DAY,
  })
})

test('unknown results fail instead of silently changing the algorithm', () => {
  assert.throws(() => calculateNextReview(1, 'Bilinmiyor', NOW))
})

test('an injected clock makes the calculation deterministic', () => {
  assert.deepEqual(
    calculateNextReview(4, 'Kolaydı', NOW),
    calculateNextReview(4, 'Kolaydı', NOW),
  )
})
