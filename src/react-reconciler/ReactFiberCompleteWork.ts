import { Lanes } from './ReactFiberLane'
import { Fiber } from './ReactInternalTypes'
import { Fragment, FunctionComponent, HostComponent, HostRoot, IndeterminateComponent } from './ReactWorkTags'
import { getRootHostContainer, getHostContext } from './ReactFiberHostContext'
import { createInstance, finalizeInitialChildren } from '../react-dom/ReactDOMHostConfig'

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
        // appendAllChildren(instance, workInProgress, false, false)
        workInProgress.stateNode = instance

        if (finalizeInitialChildren(instance, type, newProps, rootContainerInstance, currentHostContext)) {
          // markUpdate(workInProgress)
        }

        bubbleProperties(workInProgress)
        return null
      }
    }
    default:
      return null
  }
}

function updateHostContainer (current: Fiber | null, workInProgress: Fiber) {

}

function bubbleProperties (completedWork: Fiber) {

}

export {
  completeWork
}
