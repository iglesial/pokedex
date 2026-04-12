import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, expect } from 'vitest'
import * as matchers from 'vitest-axe/matchers'
import { setupServer } from 'msw/node'
import { defaultHandlers } from './msw-handlers'

expect.extend(matchers)

export const server = setupServer(...defaultHandlers)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
