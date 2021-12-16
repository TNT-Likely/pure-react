import { DOCUMENT_NODE } from './shared/HTMLNodeType'
import isCustomComponent from './isCustomComponent'
import setTextContent from './setTextContent'

const DANGEROUSLY_SET_INNER_HTML = 'dangerouslySetInnerHTML'
const SUPPRESS_CONTENT_EDITABLE_WARNING = 'suppressContentEditableWarning'
const SUPPRESS_HYDRATION_WARNING = 'suppressHydrationWarning'
const AUTOFOCUS = 'autoFocus'
const CHILDREN = 'children'
const STYLE = 'style'
const HTML = '__html'

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

// 更新属性
export function updateProperties (
  domElement: Element,
  updatePayload: Array<any>,
  tag: string,
  lastRawProps: Object,
  nextRawProps: Object
): void {
  const wasCustomComponentTag = isCustomComponent(tag, lastRawProps)
  const isCustomComponentTag = isCustomComponent(tag, nextRawProps)
  // Apply the diff.
  updateDOMProperties(
    domElement,
    updatePayload,
    wasCustomComponentTag,
    isCustomComponentTag
  )
}

function updateDOMProperties (
  domElement: Element,
  updatePayload: Array<any>,
  wasCustomComponentTag: boolean,
  isCustomComponentTag: boolean
): void {
  // TODO: Handle wasCustomComponentTag
  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i]
    const propValue = updatePayload[i + 1]
    if (propKey === STYLE) {
      // setValueForStyles(domElement, propValue)
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      // setInnerHTML(domElement, propValue)
    } else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue)
    } else {
      // setValueForProperty(domElement, propKey, propValue, isCustomComponentTag)
      domElement[propKey] = propValue
    }
  }
}
