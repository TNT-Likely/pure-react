import { Lanes } from './ReactFiberLane'
import { Fiber } from './ReactInternalTypes'
import { Fragment, FunctionComponent, HostRoot, IndeterminateComponent } from './ReactWorkTags'

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
    //   bubbleProperties(workInProgress)
      return null
    case HostRoot:
  }
}

export {
  completeWork
}
