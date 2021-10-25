import { Lane, Lanes } from "./ReactFiberLane";
import { Fiber } from "./ReactInternalTypes";
import { HostRoot } from "./ReactWorkTags";
import { processUpdateQueue, cloneUpdateQueue } from './ReactUpdateQueue'

export function beginWork(current: Fiber | null, workInProgress: Fiber, renderLanes: Lanes) {
    const updateLanes = workInProgress.lanes

    if (current !== null) {
        const oldProps = current.memoizedProps
        const newProps = workInProgress.pendingProps

        switch (workInProgress.tag) {

        }
    }

    switch (workInProgress.tag) {
        case HostRoot:
            return updateHostRoot(current, workInProgress, renderLanes)
    }
}

function updateHostRoot(current, workInProgress: Fiber, renderLanes) {
    const updateQueue = workInProgress.updateQueue

    const nextProps = workInProgress.pendingProps
    const prevState = workInProgress.memoizedProps
    const prevChildren = prevState !== null ? prevState.element : null

    cloneUpdateQueue(current, workInProgress)
    processUpdateQueue(workInProgress, nextProps, null, renderLanes)

    const nextState = workInProgress.memoizedState

    const nextChildren = nextState.element
    if (nextChildren === prevChildren) {

    }
}