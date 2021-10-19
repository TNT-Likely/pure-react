import { NoLanes } from "./ReactFiberLane";
import { createFiberRoot } from "./ReactFiberRoot";
import { RootTag } from "./ReactRootTags";
import { HostRoot } from "./ReactWorkTags";

export function createHostRootFiber(tag: RootTag) {
    return createFiber(HostRoot, null, null, 0)
}

// 创建Fiber节点
const createFiber = function(tag: number, pendingProps: any, key: null|string, mode:number) {
    return new FiberNode(tag, pendingProps, key, mode)
}

class FiberNode {
    constructor(tag: number, pendingProps: any, key: null|string, mode:number) {
        this.tag = tag
        this.pendingProps = pendingProps
        this.key = key
        this.mode = mode
    }

    // Instance
    tag: number = 0
    key: null|string = null
    elementType = null
    type = null
    stateNode: any = null

    // Fiber
    return  = null
    child = null
    sibling = null
    index: number = 0

    ref = null

    pendingProps: any = null
    memoizedProps = null
    updateQueue = null
    memoizedState = null
    dependencies = null

    mode: number = 0

    // Effects
    flags = 0
    subtreeFlags = 0
    deletions = null
    lanes = NoLanes
    childLanes = NoLanes

    alternate = null

}

export type TFiberNode = typeof FiberNode