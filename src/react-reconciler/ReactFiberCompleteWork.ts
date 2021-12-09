import { Lanes, markRootUpdated } from './ReactFiberLane'
import { Fiber } from './ReactInternalTypes'
import { Fragment, FunctionComponent, FundamentalComponent, HostComponent, HostPortal, HostRoot, HostText, IndeterminateComponent } from './ReactWorkTags'
import { getRootHostContainer, getHostContext } from './ReactFiberHostContext'
import { createInstance, createTextInstance, finalizeInitialChildren, appendInitialChild } from '../react-dom/ReactDOMHostConfig'
import { Update } from './ReactFiberFlags'

const appendAllChildren = function (
  parent: Element,
  workInProgress: Fiber,
  needsVisibilityToggle: boolean,
  isHidden: boolean
) {
  const node = workInProgress.child
  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode)
    } else if (node.tag === FundamentalComponent) {
      appendInitialChild(parent, node.stateNode.instance)
    } else if (node.tag === HostPortal) {

    } else if (node.child !== null) {
      node.child.return = node
      node = node.child
      continue
    }

    if (node === workInProgress) {
      return
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        return
      }
      node = node?.return
    }

    node.sibling.return = node.return
    node = node.sibling
  }
}

function completeWork (
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null {
  const newProps = workInProgress.pendingProps

  switch (workInProgress.tag) {
    case IndeterminateComponent:
    case FunctionComponent:
    case Fragment:
      bubbleProperties(workInProgress)
      return null
    case HostRoot: {
      const fiberRoot = workInProgress.stateNode
      if (fiberRoot.pendingContext) {
        fiberRoot.context = fiberRoot.pendingContext
        fiberRoot.pendingContext = null
      }
      updateHostContainer(current, workInProgress)
      bubbleProperties(workInProgress)
      return null
    }
    case HostComponent: {
      if (current !== null && workInProgress.stateNode != null) {
        // updateHostComponent(current, workInProgress, type, newProps, rootContainerInstance)
      } else {
        const rootContainerInstance = getRootHostContainer()
        const type = workInProgress.type

        if (!newProps) {
          bubbleProperties(workInProgress)
          return null
        }

        const currentHostContext = getHostContext()

        const instance = createInstance(type, newProps, rootContainerInstance, currentHostContext, workInProgress)
        appendAllChildren(instance, workInProgress, false, false)
        workInProgress.stateNode = instance

        if (finalizeInitialChildren(instance, type, newProps, rootContainerInstance, currentHostContext)) {
          // markUpdate(workInProgress)
        }
      }
      bubbleProperties(workInProgress)
      return null
    }
    case HostText: {
      const newText = newProps
      const rootContainerInstance = getRootHostContainer()
      const currentHostContext = getHostContext()
      if (current !== null && workInProgress.stateNode !== null) {
        const oldText = current.memoizedProps
        updateHostText(current, workInProgress, oldText, newText)
      } else {
        const instance = createTextInstance(newProps, rootContainerInstance, currentHostContext, workInProgress)
        workInProgress.stateNode = instance
        bubbleProperties(workInProgress)
        return null
      }
    }
    default:
      return null
  }
}

/** 更新文本 */
function updateHostText (
  current: Fiber,
  workInProgress: Fiber,
  oldText: string,
  newText: string
) {
  if (oldText !== newText) {
    markUpdate(workInProgress)
  }
}

/** 标记为更新 */
function markUpdate (workInProgress: Fiber) {
  workInProgress.flags |= Update
}

function updateHostContainer (current: Fiber | null, workInProgress: Fiber) {

}

function bubbleProperties (completedWork: Fiber) {

}

export {
  completeWork
}
