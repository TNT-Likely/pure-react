import { DOCUMENT_NODE } from './shared/HTMLNodeType'
import isCustomComponent from './isCustomComponent'
import setTextContent from './setTextContent'

function getOwnerDocumentFromRootContainer (rootContainerElement: Element | Document):Document {
  return rootContainerElement.nodeType === DOCUMENT_NODE ? (rootContainerElement as any) : rootContainerElement.ownerDocument
}

export {
  getOwnerDocumentFromRootContainer
}

export function setInitialProperties (domElement: Element, tag: string, rawProps: object, rootContainerElement: Element |Document) {
  const isCustomComponentTag = isCustomComponent(tag, rawProps)

  let props: object
  switch (tag) {
    default:
      props = rawProps
  }

  setInitialDOMProperties(tag, domElement, rootContainerElement, props, isCustomComponentTag)
}

// 设置初始化的dom属性
function setInitialDOMProperties (tag: string, domElement: Element, rootContainerElement: Element | Document, nextProps: object, isCustomComponentTag: boolean) {
  for (const propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) {
      continue
    }

    const nextProp = nextProps[propKey]

    if (propKey === 'children') {
      if (typeof nextProp === 'string') {
        const canSetTextContent = tag !== 'textarea' || nextProp !== ''
        if (canSetTextContent) {
          setTextContent(domElement, nextProp)
        }
      }
    }
  }
}
