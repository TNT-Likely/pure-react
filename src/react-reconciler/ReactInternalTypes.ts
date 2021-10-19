import { Lane } from "./ReactFiberLane";

export type Fiber = {
    // fiber节点类型
    tag: number

    // 唯一标识
    key: null | string

    elementType: any

    type: any

    stateNode: any

    // 下一个更新的对象
    return: Fiber | null

    child: Fiber | null
    sibling: Fiber | null
    index: number

    ref: any

    pendingProps: any
    memoizedProps: any

    updateQueue: any

    memoizedState: any

    dependencies: any

    mode: any

    flags: any
    subtreeFlags: any
    deletions: Array<Fiber> | null

    nextEffect: Fiber | null

    firstEffect: Fiber | null
    lastEffect: Fiber | null

    lanes: Lane
    childLanes: Lane

    alternate: Fiber | null

    actualDuration?: number

    actualStartTime?: number

    selfBaseDuration?: number

    treeBaseDuration?: number
}

export type SuspenseHydrationCallbacks = {
    onHydrated?: (suspenseInstance: any) => void
    onDeleted?: (suspenseInstance: any) => void
}