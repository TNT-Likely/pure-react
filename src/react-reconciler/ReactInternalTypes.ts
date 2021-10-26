import { Interaction } from "../scheduler/Tracing";
import { Lane, Lanes } from "./ReactFiberLane";
import { RootTag } from "./ReactRootTags";

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

    nextEffect?: Fiber | null

    firstEffect?: Fiber | null
    lastEffect?: Fiber | null

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

type BaseFiberRootProperties = {
    tag: RootTag,

    containerInfo: any,
    pendingChildren: any,
    current:Fiber,

    pingCache: WeakMap<any, any> | null

    finishedWork:Fiber|null,
    timeoutHandle: any,

    context: Object | null,
    pendingContext: Object | null,

    hydrate: boolean,

    mutableSourceEagerHydrationData?: Array<any> | null

    callbackNode: any,
    callbackPriority:  number,
    eventTime: any,
    expirationTimes: any,

    pendingLanes: Lanes,
    suspendedLanes: Lanes,
    pingedLanes: Lanes,
    expiredLanes: Lanes,
    mutableReadLanes: Lanes,

    finishedLanes: Lanes,
    entangledLanes: Lanes,
    entanglements: any

}

type ProfilingOnlyFiberRootProperties = {
    interactionThreadID: number,
    memoizedInteractions: Set<Interaction>,
    pendingInteractionMap: Map<Lane|Lanes, Set<Interaction>>
}

type SuspenseCallbackOnlyFiberRootProperties = {
    hydrationCallbacks: null | SuspenseHydrationCallbacks
}

export type FiberRoot = BaseFiberRootProperties & ProfilingOnlyFiberRootProperties & SuspenseCallbackOnlyFiberRootProperties