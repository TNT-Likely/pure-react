import ReactCurrentDispatcher from './ReactCurrentDispatcher'
import { Dispatch, BaseStateAction, Dispatcher } from '../react-reconciler/ReactInternalTypes'

function resolveDispatcher () {
  const dispatcher = ReactCurrentDispatcher.current as Dispatcher
  return dispatcher
}

export function useState<T> (initialState: (() => T) | T): [T, Dispatch<BaseStateAction<T>>] {
  const dispatcher = resolveDispatcher()

  return dispatcher.useState(initialState)
}
