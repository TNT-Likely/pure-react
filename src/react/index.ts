import { createElement } from './ReactElement'
import { REACT_FRAGMENT_TYPE } from '../shared/ReactSymbols'
import { useState } from './ReactHooks'
const PureComponent = () => {
  console.log('pure-component')
}

const React = {
  PureComponent,
  createElement,
  Fragment: REACT_FRAGMENT_TYPE,
  useState
}

export default React
