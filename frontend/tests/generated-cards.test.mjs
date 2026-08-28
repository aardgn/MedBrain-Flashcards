import assert from 'node:assert/strict'
import test from 'node:test'

import {
  GeneratedCardsValidationError,
  parseGeneratedCards,
} from '../lib/generated-cards.ts'

test('parses and trims a valid card array', () => {
  assert.deepEqual(
    parseGeneratedCards('[{"soru":"  Soru? ","cevap":" Cevap. "}]'),
    [{ soru: 'Soru?', cevap: 'Cevap.' }],
  )
})

test('accepts a JSON markdown fence', () => {
  assert.deepEqual(
    parseGeneratedCards('```json\n[{"soru":"S","cevap":"C"}]\n```'),
    [{ soru: 'S', cevap: 'C' }],
  )
})

test('rejects the model REJECT sentinel', () => {
  assert.throws(() => parseGeneratedCards('REJECT'), GeneratedCardsValidationError)
})

test('rejects invalid JSON and non-array JSON', () => {
  assert.throws(() => parseGeneratedCards('{broken'), /geçerli JSON/)
  assert.throws(() => parseGeneratedCards('{"soru":"S","cevap":"C"}'), /kart listesi/)
})

test('rejects an empty array', () => {
  assert.throws(() => parseGeneratedCards('[]'), /Kart üretilemedi/)
})

test('rejects missing or blank fields', () => {
  assert.throws(() => parseGeneratedCards('[{"soru":"","cevap":"C"}]'), /eksik/)
  assert.throws(() => parseGeneratedCards('[{"soru":"S"}]'), /eksik/)
})
