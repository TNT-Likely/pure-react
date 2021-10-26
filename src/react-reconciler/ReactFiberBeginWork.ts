import { Lane, Lanes } from "./ReactFiberLane";
import { Fiber } from "./ReactInternalTypes";
import { HostRoot } from "./ReactWorkTags";
import { processUpdateQueue, cloneUpdateQueue } from './ReactUpdateQueue'
import { reconcileChildFibers } from "./ReactChildFiber";

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

    const root = workInProgress.stateNode
    if (root.hydrate) {

    } else {
        reconcileChildren(current, workInProgress, nextChildren, renderLanes)
    }

    return workInProgress.child
}

// 调和儿子
export function reconcileChildren(current:Fiber | null, workInProgress: Fiber, nextChildren: any, renderLanes: Lanes) {
    if(current === null) {

    } else {
        workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren, renderLanes)
    }
}