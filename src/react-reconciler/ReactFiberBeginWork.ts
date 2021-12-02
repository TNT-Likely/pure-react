import { Lanes, includesSomeLane } from './ReactFiberLane'
import { Fiber, FiberRoot } from './ReactInternalTypes'
import { HostRoot, IndeterminateComponent, FunctionComponent, HostComponent, HostText } from './ReactWorkTags'
import { processUpdateQueue, cloneUpdateQueue } from './ReactUpdateQueue'
import { reconcileChildFibers, mountChildFibers, cloneChildFibers } from './ReactChildFiber'
import { Placement } from './ReactFiberFlags'
import { renderWithHooks } from './ReactFiberHooks'
import { shouldSetTextContent } from './ReactDomHostConfig'
import { pushHostContainer } from './ReactFiberHostContext'

let didReceiveUpdate: boolean = false

// 挂载混合组件
function mountIndeterminateComponent (
  _current,
  workInProgress: Fiber,
  Component,
  renderLanes
) {
  if (_current !== null) {
    _current.alternate = null
    workInProgress.alternate = null
    workInProgress.flags |= Placement
  }

  const props = workInProgress.pendingProps
  let context
  // const unmaskedContext = getUnmaskedContext(workInProgress, Component, false)
  // context = getMaskedContext(workInProgress, unmaskedContext)
  // prepareToReadContext(workInProgress, renderLanes)

  let value

  value = renderWithHooks(null, workInProgress, Component, props, context, renderLanes)

  if (typeof value.render === 'function' && value.$$typeof === undefined) {

  } else {
    workInProgress.tag = FunctionComponent
    reconcileChildren(null, workInProgress, value, renderLanes)
  }

  return workInProgress.child
}

function bailoutOnAlreadyFinishedWork (
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: number
) {
  if (current !== null) {
    workInProgress.dependencies = current.dependencies
  }

  cloneChildFibers(current, workInProgress)

  return workInProgress.child
}

export function beginWork (current: Fiber | null, workInProgress: Fiber, renderLanes: Lanes) {
  const updateLanes = workInProgress.lanes

  if (current !== null) {
    const oldProps = current.memoizedProps
    const newProps = workInProgress.pendingProps

    if (oldProps !== newProps) {
      didReceiveUpdate = true
    } else if (!includesSomeLane(renderLanes, updateLanes)) {
      didReceiveUpdate = false
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes)
    }
  }

  switch (workInProgress.tag) {
    case IndeterminateComponent: {
      // 挂载不确定的组件
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type,
        renderLanes
      )
    }
    case FunctionComponent: { // 更新函数式组件
      const Component = workInProgress.type
      const unresolvedProps = workInProgress.pendingProps
      const resolvedProps = workInProgress.elementType === Component ? unresolvedProps : unresolvedProps

      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes
      )
    }

    case HostRoot: // 更新宿主节点
      return updateHostRoot(current, workInProgress, renderLanes)
    case HostComponent: // 更新宿主组件
      return updateHostComponent(current, workInProgress, renderLanes)
    case HostText: // 更新文本节点
      return updateHostText(current, workInProgress, renderLanes)
  }
}

/** 更新函数式组件 */
function updateFunctionComponent (
  current: Fiber | null,
  workInProgress: Fiber,
  Component: (props, args) => void,
  resolvedProps: Object,
  renderLanes: number
) {
  const context = null
  const nextChildren = renderWithHooks(current, workInProgress, Component, resolvedProps, context, renderLanes)

  reconcileChildren(current, workInProgress, nextChildren, renderLanes)

  return workInProgress.child
}

function updateHostText (
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
) {
  return null
}

function updateHostComponent (
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
) {
  const type = workInProgress.type
  const nextProps = workInProgress.pendingProps
  const prevProps = current !== null ? current.memoizedProps : null

  let nextChildren = nextProps.children
  const isDirectTextChild = shouldSetTextContent(type, nextProps)

  if (isDirectTextChild) {
    nextChildren = null
  } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
    workInProgress.flags |= 16
  }

  reconcileChildren(current, workInProgress, nextChildren, renderLanes)

  return workInProgress.child
}

function pushHostRootContext (workInProgress) {
  const root = (workInProgress.stateNode as FiberRoot)

  // if (root.pendingContext) {
  //   pushTopLevelContextObject(workInProgress, root.pendingContext, root.pendingContext !== root.context)
  // } else if (root.context) {
  //   pushTopLevelContextObject(workInProgress, root.context, false)
  // }

  pushHostContainer(workInProgress, root.containerInfo)
}

function updateHostRoot (current, workInProgress: Fiber, renderLanes) {
  pushHostRootContext(workInProgress)
  const updateQueue = workInProgress.updateQueue

  const nextProps = workInProgress.pendingProps
  const prevState = workInProgress.memoizedProps
  const prevChildren = prevState !== null ? prevState.element : null

  // 克隆更新队列
  cloneUpdateQueue(current, workInProgress)

  // 处理更新队列
  processUpdateQueue(workInProgress, nextProps, null, renderLanes)

  const nextState = workInProgress.memoizedState

  const nextChildren = nextState.element
  if (nextChildren === prevChildren) {

  }

  const root = workInProgress.stateNode
  if (root.hydrate) {

  } else {
    // 这里主要是计算出Fiber子节点
    reconcileChildren(current, workInProgress, nextChildren, renderLanes)
  }

  return workInProgress.child
}

// 调和儿子
export function reconcileChildren (current: Fiber | null, workInProgress: Fiber, nextChildren: any, renderLanes: Lanes) {
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren, renderLanes)
  } else {
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren, renderLanes)
  }
}
