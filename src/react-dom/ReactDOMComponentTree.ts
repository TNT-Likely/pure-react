import { Props } from '../react-reconciler/ReactDomHostConfig'
import { Fiber } from '../react-reconciler/ReactInternalTypes'
import { Container } from './ReactDOMHostConfig'

const randomKey = Math.random().toString(36).slice(2)
const internalInstanceKey = '__reactFiber$' + randomKey
const internalContainerInstanceKey = '__reactContainer$' + randomKey
const internalPropsKey = '__reactProps$' + randomKey
const internalEventHandlersKey = '__reactEvent$' + randomKey

export function markContainerAsRoot (hostRoot: Fiber, node: Container) {
  node[internalContainerInstanceKey] = hostRoot
}

export function updateFiberProps (node: any, props: Props) {
  (node as any)[internalPropsKey] = props
}

/** 预缓存Fiber节点, 主要是后面派发事件用 */
export function precacheFiberNode (
  hostInst: Fiber,
  node: Element
) {
  node[internalInstanceKey] = hostInst
}

/** 获取节点监听列表 */
export function getEventListenerSet (node: EventTarget): Set<string> {
  let elementListenerSet = node[internalEventHandlersKey]
  if (elementListenerSet === undefined) {
    elementListenerSet = node[internalEventHandlersKey] = new Set()
  }
  return elementListenerSet
}

export function getClosestInstanceFromNode (targetNode: Node): null | Fiber {
  const tagrgetInst = targetNode[internalInstanceKey]
  if (tagrgetInst) {
    return tagrgetInst
  }
}

/** 从html实际节点上取出Fiber的属性 */
export function getFiberCurrentPropsFromStateNode (node) {
  return node[internalPropsKey]
}
