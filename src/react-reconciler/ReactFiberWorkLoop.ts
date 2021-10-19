import { Lane } from "./ReactFiberLane"
import { Fiber } from "./ReactInternalTypes"
import { HostRoot } from "./ReactWorkTags"

let workInProgressRoot: any | null = null

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

}

function markUpdateLaneFromFiberToRoot(sourceFiber: Fiber, lane: Lane) {
    let node = sourceFiber
    let parent = sourceFiber.return

    while(parent !== null) {
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
