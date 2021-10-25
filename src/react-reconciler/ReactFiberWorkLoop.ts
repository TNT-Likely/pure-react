import ReactCurrentOwner from "../react/ReactCurrentOwner"
import { Lane, Lanes, NoLanes, SyncLane } from "./ReactFiberLane"
import { Fiber } from "./ReactInternalTypes"
import { HostRoot } from "./ReactWorkTags"

let workInProgressRoot: any | null = null
let workInProgress: any = null
let mostRecentlyUpdatedRoot: any = null
let workInProgressRootRenderLanes: Lane = NoLanes

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

    if (lane === SyncLane) {
        performSyncWorkOnRoot(root)
    } else {

    }

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
    }

    const finishedWork = root.current.alternate
    root.finishedWork = finishedWork
    root.finishedLanes = lanes
    commitRoot(root)
    ensureRootIsScheduled(root, 0)
    return null
}

function renderRootSync(root: any, lanes: Lanes) {
    do {
        try {
            workLoopSync()
            break;
        } catch (e) {

        }
    } while (true)

    workInProgressRoot = null
    workInProgressRootRenderLanes = NoLanes
}

function workLoopSync() {
    while (workInProgress !== null) {
        performUnitOfWork(workInProgress)
    }
}

function performUnitOfWork(unitOfWork: Fiber): void {
    const current = unitOfWork.alternate

    let next = beginWork(current, unitOfWork, '')
    unitOfWork.memoizedProps = unitOfWork.pendingProps
    if (next === null) {
        completeUnitOfWork(unitOfWork)
    } else {
        workInProgress = next
    }

    ReactCurrentOwner.current = null
}