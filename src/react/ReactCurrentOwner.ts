

import { Fiber } from "../react-reconciler/ReactInternalTypes"
export type TReactCurrentOwner = {
    current: null | Fiber
}
const ReactCurrentOwner: TReactCurrentOwner = {
    current: null
}

export default ReactCurrentOwner