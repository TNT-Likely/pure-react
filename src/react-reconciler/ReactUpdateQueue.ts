import { Lane } from "./ReactFiberLane";
import { Fiber } from "./ReactInternalTypes";

type SharedQueue<State> = {
    pending: Update<State> | null
}

export const UpdateState = 0;

export type Update<State> = {
    eventTime: number,
    lane: Lane,

    tag: number,
    payload: any,

    callback: null | Function
    next: Update<State> | null
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