import ReactCurrentOwner from "../react/ReactCurrentOwner"
import { Lane, Lanes, NoLanes, SyncLane } from "./ReactFiberLane"
import { Fiber } from "./ReactInternalTypes"
import { HostRoot } from "./ReactWorkTags"
import { beginWork } from './ReactFiberBeginWork'
import { createWorkInProgress } from './ReactFiber'

let workInProgressRoot: any | null = null
let workInProgress: any = null
let mostRecentlyUpdatedRoot: any = null
let workInProgressRootRenderLanes: Lane = NoLanes
export let subtreeRenderLanes = NoLanes

// 请求更新优先级
export function requestUpdateLane(fiber: any): Lane {
    return 0
}

// 请求事件事件
export function requestEventTime() {
    return 0
}

// 调度更新
export function scheduleUpdateOnFiber(fiber: Fiber, lane: Lane, eventTime: number) {
    const root = markUpdateLaneFromFiberToRoot(fiber, lane)

    if (root === workInProgressRoot) {

    }

    // if (lane === SyncLane) {
    performSyncWorkOnRoot(root)
    // } else {

    // }

    mostRecentlyUpdatedRoot = root
}

function markUpdateLaneFromFiberToRoot(sourceFiber: Fiber, lane: Lane) {
    let node = sourceFiber
    let parent = sourceFiber.return

    while (parent !== null) {
        node = parent
        parent = parent.return
    }

    if (node.tag === HostRoot) {
        const root = node.stateNode
        return root
    } else {
        return null
    }
}

function performSyncWorkOnRoot(root) {
    let lanes
    let exitStatus

    if (root === workInProgressRoot) {
        lanes = workInProgressRootRenderLanes
        exitStatus = renderRootSync(root, lanes)
    } else {
        lanes = workInProgressRootRenderLanes
        exitStatus = renderRootSync(root, lanes)
    }

    const finishedWork = root.current.alternate
    root.finishedWork = finishedWork
    root.finishedLanes = lanes
    commitRoot(root)
    ensureRootIsScheduled(root, 0)
    return null
}

function renderRootSync(root: any, lanes: Lanes) {
    if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) {
        prepareFreshStack(root, lanes)
    }

    do {
        try {
            workLoopSync()
            break;
        } catch (e) {
            handleError(root, e)
        }
    } while (true)

    workInProgressRoot = null
    workInProgressRootRenderLanes = NoLanes
}

function prepareFreshStack(root: any, lanes: Lanes) {
    root.finishedWork = null
    root.finishedLanes = NoLanes

    // const timeoutHandle = root.timeoutHandle
    // if (timeoutHandle !== noTimeout) {
    //     root.timeoutHandle = noTimeout

    //     cancelTimeout(timeoutHandle)
    // }
    workInProgressRoot = root
    workInProgress = createWorkInProgress(root.current, null)
}

function workLoopSync() {
    while (workInProgress !== null) {
        performUnitOfWork(workInProgress)
    }
}

function performUnitOfWork(unitOfWork: Fiber): void {
    const current = unitOfWork.alternate

    let next = beginWork(current, unitOfWork, subtreeRenderLanes)

    unitOfWork.memoizedProps = unitOfWork.pendingProps

    if (next === null) {
        completeUnitOfWork(unitOfWork)
    } else {
        workInProgress = next
    }

    ReactCurrentOwner.current = null
}

function handleError(root, thrownValue): void {
    workInProgress = null
}