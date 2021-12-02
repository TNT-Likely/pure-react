import { ReactElement } from '../shared/ReactElementType'
import { Lanes, NoLanes } from './ReactFiberLane'
import { createFiberRoot } from './ReactFiberRoot'
import { Fiber } from './ReactInternalTypes'
import { RootTag } from './ReactRootTags'
import { ClassComponent, HostComponent, HostRoot, HostText, IndeterminateComponent } from './ReactWorkTags'

// 是否为类组件
function shouldConstruct (Component: Function) {
  const prototype = Component.prototype
  return !!(prototype && prototype.isReactComponent)
}

// 创建宿主根fiber节点
export function createHostRootFiber (tag: RootTag) {
  return createFiber(HostRoot, null, null, 0)
}

// 创建Fiber节点
const createFiber = function (tag: number, pendingProps: any, key: null | string, mode: number): Fiber {
  return new FiberNode(tag, pendingProps, key, mode)
}

class FiberNode {
  constructor (tag: number, pendingProps: any, key: null | string, mode: number) {
    this.tag = tag
    this.pendingProps = pendingProps
    this.key = key
    this.mode = mode
  }

  // Instance
  tag: number = 0
  key: null | string = null
  elementType = null // 节点类型
  type = null
  stateNode: any = null // 实际的html元素节点

  // Fiber
  return = null // 父节点
  child = null // 子节点
  sibling = null // 兄弟节点
  index: number = 0

  ref = null

  pendingProps: any = null
  memoizedProps = null
  updateQueue = null
  memoizedState = null
  dependencies = null

  mode: number = 0

  // Effects
  flags = 0
  subtreeFlags = 0
  deletions = null
  lanes = NoLanes
  childLanes = NoLanes

  alternate = null
}

export type TFiberNode = typeof FiberNode

// 创建工作进程
export function createWorkInProgress (current: Fiber, pendingProps: any): Fiber {
  let workInProgress: any = current.alternate
  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key, current.mode)

    workInProgress.elementType = current.elementType
    workInProgress.type = current.type
    workInProgress.stateNode = current.stateNode

    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
    workInProgress.pendingProps = pendingProps
    workInProgress.type = current.type

    // workInProgress.subtreeFlags = NoFlags
    workInProgress.deletions = null
  }

  workInProgress.flags = current.flags
  workInProgress.childLanes = current.childLanes
  workInProgress.lanes = current.lanes

  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState
  workInProgress.updateQueue = current.updateQueue

  const currentDependencies = current.dependencies
  workInProgress.dependencies = currentDependencies === null
    ? null
    : {
        lanes: currentDependencies.lanes,
        firstContext: currentDependencies.firstContext
      }

  workInProgress.sibling = current.sibling
  workInProgress.index = current.index
  workInProgress.ref = current.ref

  return workInProgress
}

// 根据元素创建Fiber节点
export function createFiberFromElement (
  element: ReactElement,
  mode: number,
  lanes: Lanes
): Fiber {
  const owner = null
  const type = element.type
  const key = element.key
  const pendingProps = element.props

  const fiber = createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes)

  return fiber
}

// 根据类型和属性创建Fiber节点
export function createFiberFromTypeAndProps (
  type: any,
  key: null | string,
  pendingProps: any,
  owner: null | Fiber,
  mode: number,
  lanes: Lanes
): Fiber {
  let fiberTag = IndeterminateComponent
  const resolvedType = type

  if (typeof type === 'function') {
    if (shouldConstruct(type)) {
      fiberTag = ClassComponent
    }
  } else if (typeof type === 'string') {
    fiberTag = HostComponent
  } else {
    // 先省略一下，后面补上
    switch (type) {

    }
  }

  const fiber = createFiber(fiberTag, pendingProps, key, mode)
  fiber.elementType = type
  fiber.lanes = lanes
  fiber.type = resolvedType

  return fiber
}

// 创建纯文本的Fiber节点
export function createFiberFromText (content: string, mode: number, lanes: Lanes) {
  const fiber = createFiber(HostText, content, null, mode)

  fiber.lanes = lanes

  return fiber
}
