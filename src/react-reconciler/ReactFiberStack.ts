import { Fiber } from './ReactInternalTypes'

const valueStack: Array<any> = []

let fiberStack: Array<Fiber | null>

let index = -1

export type StackCursor<T> = {
    current: T
}

function createCursor<T> (defaultValue: T): StackCursor<T> {
  return {
    current: defaultValue
  }
}

function pop<T> (cursor: StackCursor<T>, fiber:Fiber): void {
  if (index < 0) {
    return
  }

  cursor.current = valueStack[index]

  valueStack[index] = null

  index--
}

function push<T> (cursor: StackCursor<T>, value: T, fiber: Fiber): void {
  index++

  valueStack[index] = cursor.current

  cursor.current = value
}

export {
  createCursor,
  pop,
  push
}
