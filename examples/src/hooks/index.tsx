import React, { useState } from 'react'
import ReactDom from 'react-dom'

const App = function () {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    console.log('点击事件')
    // setCount(count + 1)
  }

  return <>
    <p>count:{count}</p>
    <button onClick={handleClick}>累加</button>
  </>
}

ReactDom.render(<App />, document.querySelector('#root'))
