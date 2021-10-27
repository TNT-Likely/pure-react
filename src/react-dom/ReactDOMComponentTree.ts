import { Fiber } from '../react-reconciler/ReactInternalTypes'
import { Container } from './ReactDOMHostConfig'

const randomKey = Math.random().toString(36).slice(2)
const internalContainerInstanceKey = '__reactContainer$' + randomKey

export function markContainerAsRoot (hostRoot: Fiber, node: Container) {
  node[internalContainerInstanceKey] = hostRoot
}
