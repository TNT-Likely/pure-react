import { isSubsetOfLanes, Lane, Lanes, NoLane, NoLanes, mergeLanes } from "./ReactFiberLane";
import { Fiber } from "./ReactInternalTypes";

type SharedQueue<State> = {
    pending: Update<State> | null
}

export const UpdateState = 0;
let hasForceUpdate = false

export type Update<State> = {
    eventTime: number,
    lane: Lane,

    tag: number,
    payload: any,

    callback: null | Function
    next: Update<State> | null
}

export type UpdateQueue<State> = {
    baseState: State
    firstBaseUpdate: Update<State> |null
    lastBaseUpdate: Update<State> | null
    shared: SharedQueue<State>
    effects: Array<Update<State>> | null
}

// 创建更新对象
export function createUpdate(eventTime: number, lane: Lane): Update<any> {
    const update = {
        eventTime,
        lane,

        tag: UpdateState,
        payload: null,
        callback: null,

        next: null
    }

    return update
}

// 初始化更新队列
export function initializeUpdateQueue<State>(fiber:Fiber|any):void {
    const queue:UpdateQueue<State> = {
        baseState: fiber.memoizedState,
        firstBaseUpdate:null,
        lastBaseUpdate: null,
        shared: {
            pending: null
        },
        effects: null
    }

    fiber.updateQueue = queue
}

// 更新塞入队列
export function enqueueUpdate<State>(fiber: Fiber, update: Update<State>) {
    // 下一个更新的队列
    const updateQueue = fiber.updateQueue

    if (updateQueue === null) {
        return
    }

    const sharedQueue: SharedQueue<State> = updateQueue.shared

    // 创建一个环形链表，首尾相连
    const pending = sharedQueue.pending
    if (pending === null) {
        update.next = update
    } else {
        update.next = pending.next
        pending.next = update
    }
    sharedQueue.pending = update
}

// 克隆更新队列
export function cloneUpdateQueue<State>(current:Fiber, workInProgress: Fiber) {
    const queue:UpdateQueue<State> = workInProgress.updateQueue
    const currentQueue:UpdateQueue<State> = current.updateQueue

    if (queue === currentQueue) {
        const clone:UpdateQueue<State> = {
            baseState: currentQueue.baseState,
            firstBaseUpdate: currentQueue.firstBaseUpdate,
            lastBaseUpdate: currentQueue.lastBaseUpdate,
            shared: currentQueue.shared,
            effects: currentQueue.effects
        }
        
        workInProgress.updateQueue = clone
    }
}

// 处理更新队列
export function processUpdateQueue<State>(
    workInProgress: Fiber,
    props: any,
    instance: any,
    renderLanes: Lanes
){
    const queue: UpdateQueue<State> = workInProgress.updateQueue
    hasForceUpdate = false

    let firstBaseUpdate = queue.firstBaseUpdate
    let lastBaseUpdate  = queue.lastBaseUpdate

    let pendingQueue = queue.shared.pending
    if (pendingQueue !== null) {
        queue.shared.pending = null

        const lastPendingUpdate = pendingQueue
        const firstPendingUpdate = lastPendingUpdate.next
        lastPendingUpdate.next = null

        if (lastBaseUpdate === null) {
            firstBaseUpdate = firstPendingUpdate
        } else {
            lastBaseUpdate.next = firstPendingUpdate
        }

        lastBaseUpdate = lastPendingUpdate

        const current = workInProgress.alternate

        if (current !== null) {
            const currentQueue:UpdateQueue<State> = current.updateQueue
            const currentLastBaseUpdate = currentQueue.lastBaseUpdate

            if (currentLastBaseUpdate !== lastBaseUpdate) {
                if (currentLastBaseUpdate === null) {
                    currentQueue.firstBaseUpdate = firstPendingUpdate
                } else {
                    currentLastBaseUpdate.next = firstPendingUpdate
                }
                currentQueue.lastBaseUpdate = lastPendingUpdate
            }
        }
    }

    if (firstBaseUpdate !== null) {
        let newState = queue.baseState

        let newLanes = NoLanes
        let newBaseState:any = null
        let newFirstBaseUpdate: any = null
        let newLastBaseUpdate: any = null

        let update:any = firstBaseUpdate

        do {
            const updateLane = update.lane
            const updateEventTime = update.eventTime

            if (!isSubsetOfLanes(renderLanes, updateLane)) {
                const clone:Update<State> = {
                    eventTime: updateEventTime,
                    lane: updateLane,
                    tag: update.tag,
                    payload: update.payload,
                    callback: update.callback,

                    next:null
                }

                if(newLastBaseUpdate === null) {
                    newFirstBaseUpdate = newLastBaseUpdate = clone
                    newBaseState = newState
                } else {
                    newLastBaseUpdate = newLastBaseUpdate.next = clone
                }
                newLanes = mergeLanes(newLanes, updateLane)
            } else {
                if (newLastBaseUpdate !== null) {
                    const clone:Update<State> = {
                        eventTime: updateEventTime,
                        lane: NoLane,
                        tag: update.tag,
                        payload: update.payload,
                        callback: update.callback,
                        next: null
                    }
                    newLastBaseUpdate = newLastBaseUpdate.next = clone
                }
            }

            newState = getStateFromUpdate(workInProgress, queue, update, newState, props, instance)

            const callback = update.callback
            if (callback !== null) {
                workInProgress.flags != callback
                const effects = queue.effects
                if (effects === null) {
                    queue.effects = [update]
                } else {
                    effects.push(update)
                }
            }
            update = update.next
            if (update === null) {
                if (pendingQueue === null) {
                    break;
                } else {
                    const lastPendingUpdate = pendingQueue
                    const firstPendingUpdate = lastPendingUpdate.next
                    lastPendingUpdate.next = null
                    update = firstPendingUpdate
                    queue.lastBaseUpdate = lastPendingUpdate
                    queue.shared.pending = null
                }
            }
        } while(true)

        if (newLastBaseUpdate === null) {
            newBaseState = newState
        }

        queue.baseState = newBaseState
        queue.firstBaseUpdate = newFirstBaseUpdate
        queue.lastBaseUpdate = newLastBaseUpdate

        workInProgress.lanes = newLanes
        workInProgress.memoizedState = newState
    }

}

function getStateFromUpdate<State>(
    workInProgress:Fiber,
    queue:UpdateQueue<State>,
    update: Update<State>,
    prevState: State,
    nextProps: any,
    instance: any
) {
    let newState = prevState

    return newState
}