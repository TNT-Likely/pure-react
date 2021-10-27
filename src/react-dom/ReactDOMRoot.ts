import { LegacyRoot, RootTag } from '../react-reconciler/ReactRootTags'
import { Container } from './ReactDOMHostConfig'
import { enableEagerRootListeners } from '../shared/ReactFeatureFlags'
import { COMMENT_NODE } from './shared/HTMLNodeType'
import { createContainer } from '../react-reconciler/ReactFiberReconciler'
import { markContainerAsRoot } from './ReactDOMComponentTree'

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
        mutableSources?: Array<any>
    },
}

export function createLegacyRoot (container: Container,
  options?: RootOptions) {
  return new ReactDOMBlockingRoot(container, LegacyRoot, options)
}

function createRootImpl (
  container: Container,
  tag: RootTag,
  options: void |RootOptions
) {
  // 是否注水
  const hydrate = options != null && options.hydrate === true

  // 注水回调
  const hydrateCallbacks = (options != null && options.hydrationOptions) || null

  const mutableSources = (options != null && options.hydrationOptions != null && options.hydrationOptions?.mutableSources) || null

  const root = createContainer(container, tag, hydrate, hydrateCallbacks)
  markContainerAsRoot(root.current, container)
  const containerNodeType = container.nodeType

  if (enableEagerRootListeners) {
    const rootContainerElement = container.nodeType === COMMENT_NODE ? container.parentNode : container
    // listenToAllSupportedEvents(rootContainerElement)
  }

  return root
}

declare class ReactDOMBlockingRoot {
  constructor(container: Container, tag: RootTag, options: void| RootOptions)
    render: () => void
}

function ReactDOMBlockingRoot (this: any,
  container: Container,
  tag: RootTag,
  options: void | RootOptions
) {
  this._internalRoot = createRootImpl(container, tag, options)
}

ReactDOMBlockingRoot.prototype.render = function () {

}
