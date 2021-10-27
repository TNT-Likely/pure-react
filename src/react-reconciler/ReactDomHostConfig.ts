export type Props = {
    autoFocus?: boolean
    children?: any
    disabled?: boolean
    hidden?: boolean
    suppressHydrationWarning?: boolean
    dangerouslySetInnerHTML?: any
    style?: { display?: string }
    bottom?: null | number
    left?: null | number
    right?: null | number
    top?: null | number
}

// 是否应该设置文本内容
export function shouldSetTextContent(type: string, props: Props): boolean {
    return (
        type === 'textarea' ||
        type === 'option' ||
        type === 'noscript' ||
        typeof props.children === 'string' ||
        typeof props.children === 'number' ||
        (typeof props.dangerouslySetInnerHTML === 'object' &&
            props.dangerouslySetInnerHTML !== null &&
            props.dangerouslySetInnerHTML.__html != null)
    )
}