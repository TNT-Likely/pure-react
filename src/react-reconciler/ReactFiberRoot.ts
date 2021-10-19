import { Container } from "../react-dom/ReactDOMHostConfig";
import { SuspenseHydrationCallbacks } from "./ReactInternalTypes";
import { RootTag } from "./ReactRootTags";
import { NoLanes } from "./ReactFiberLane";
import { createHostRootFiber, TFiberNode } from "./ReactFiber";
import { initializeUpdateQueue } from "./ReactUpdateQueue";

export function createFiberRoot(
    containerInfo: Container,
    tag: RootTag,
    hydrate: boolean,
    hydrateCallbacks: null | SuspenseHydrationCallbacks
) {
    // 创建fiber根节点
    const root = new FiberRootNode(containerInfo, tag, hydrate)

    root.hydrationCallbacks = hydrateCallbacks

    const uninitializedFiber = createHostRootFiber(tag)
    root.current = uninitializedFiber

    uninitializedFiber.stateNode = root

    initializeUpdateQueue(uninitializedFiber)

    return root
}

class FiberRootNode {
    constructor(containerInfo: Container, tag:RootTag, hydrate: boolean) {
        this.containerInfo = containerInfo
        this.tag = tag
        this.hydrate = hydrate
    }

    tag: RootTag
    containerInfo: Container
    pendingChildren = null
    current:any = null
    pingCache = null
    finishedWork = null
    timeoutHandle =null
    context = null
    pendingContext = null
    hydrate: boolean = false
    hydrationCallbacks: SuspenseHydrationCallbacks | null = null
    callbackNoye = null
    callbackPriority = 0
    eventTimes = 0
    expirationTimes = 0

    pendingLanes = NoLanes
    suspendedLanes = NoLanes
    pingedLanes = NoLanes
    expiredLanes = NoLanes
    mutableReadLanes = NoLanes
    finishedLanes = NoLanes

    entangledLanes = NoLanes

}
