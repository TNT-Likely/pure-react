import { LegacyRoot } from "../react-reconciler/ReactRootTags";
import { Container } from "./ReactDOMHostConfig";

export type RootType = {
    render: (children: any) => void
    unmount: () => void
    _internalRoot: any
}

export type RootOptions = {
    hydrate?: boolean
    hydrationOptions?: {
        onHydrated?: (suspenseNode: Comment) => void
        onDeleted?: (suspenseNode: Comment) => void
    }
}


export function createLegacyRoot(container: Container,
    options?: RootOptions) {
    return new ReactDOMBlockingRoot(container, LegacyRoot, options)
}

function ReactDOMBlockingRoot(
    container: Container,
    tag: number,
    options: void | RootOptions
) {

}
ReactDOMBlockingRoot.prototype.render = function () {

}

