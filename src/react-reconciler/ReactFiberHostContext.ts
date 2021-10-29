import { Container, getRootHostContext } from '../react-dom/ReactDOMHostConfig'
import { createCursor, pop, push } from './ReactFiberStack'
import { Fiber } from './ReactInternalTypes'

const NO_CONTEXT = {} as any

const rootInstanceStackCursor = createCursor(NO_CONTEXT)
const contextStackCursor = createCursor(NO_CONTEXT)

function getRootHostContainer ():Container {
  const rootInstance = requiredContext(rootInstanceStackCursor.current)
  return rootInstance
}

function getHostContext () {
  const context = requiredContext(contextStackCursor.current)
  return context
}

function requiredContext<T> (c: T): T {
  return c
}

function pushHostContainer (fiber: Fiber, nextRootInstance: Container) {
  push(rootInstanceStackCursor, nextRootInstance, fiber)
  push(contextStackCursor, fiber, fiber)
  push(contextStackCursor, NO_CONTEXT, fiber)

  const nextRootContext = getRootHostContext(nextRootInstance)
  pop(contextStackCursor, fiber)
  push(contextStackCursor, nextRootContext, fiber)
}

export {
  getRootHostContainer,
  getHostContext,
  pushHostContainer
}
