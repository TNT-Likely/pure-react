import { createElement } from './ReactElement'
import { REACT_FRAGMENT_TYPE } from '../shared/ReactSymbols'
import { useState } from './ReactHooks'
import ReactSharedInternal from './ReactSharedInternal'
const PureComponent = () => {
  console.log('pure-component')
}

const React = {
  PureComponent,
  createElement,
  Fragment: REACT_FRAGMENT_TYPE,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: ReactSharedInternal,
  useState
}

export default React
