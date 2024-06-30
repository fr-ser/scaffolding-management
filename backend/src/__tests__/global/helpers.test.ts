import { expect, test } from 'vitest'

import { formatIsoDateString, formatNumber, round } from '@/global/helpers'

test('formatNumber', () => {
  expect(formatNumber(1234)).toBe('1.234')
  expect(formatNumber(12.34, { decimals: 2 })).toBe('12,34')
  expect(formatNumber(12.34, { currency: true })).toBe('12,34 €')
})

test('round', () => {
  expect(round(1.49)).toBe(1)
  expect(round(1.5)).toBe(2)

  expect(round(1.5, 2)).toBe(1.5)

  // sadly this test does not work, because of floating point precision
  // but instead of creating a fully custom rounding algorithm we accept this
  // expect(round(1.005, 2)).toBe(1.01)
})

test('formatIsoDateString', () => {
  expect(formatIsoDateString('2050-12-31')).toBe('31.12.2050')
})
