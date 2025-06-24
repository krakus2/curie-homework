import { useEffect, useRef, type RefObject } from 'react'

type CallbackRecord = Record<string, ((...args: any[]) => void) | undefined>

export const useStableCallbacks = <T extends CallbackRecord>(
  callbacks: T
): {
  [K in keyof T]: RefObject<T[K]>
} => {
  const refs = useRef({} as { [K in keyof T]: RefObject<T[K]> })

  // Initialize refs on first render
  for (const key in callbacks) {
    if (!refs.current[key]) {
      refs.current[key] = { current: callbacks[key] }
    }
  }

  // Update refs on change
  useEffect(() => {
    for (const key in callbacks) {
      refs.current[key].current = callbacks[key]
    }
  }, Object.values(callbacks)) // eslint-disable-line react-hooks/exhaustive-deps

  return refs.current
}
