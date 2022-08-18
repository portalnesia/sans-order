import {HYDRATE} from 'next-redux-wrapper';
import {State,ActionType} from '../types'
import {Reducer} from 'redux'

const initialState: State={
  theme:'auto',
  redux_theme:'light',
  user:null,
  appToken:null,
  ready:false,
  socket:null,
  report:null
}

const rootReducer: Reducer<State,ActionType> = (state = initialState, action) => {
  switch (action.type) {
    case HYDRATE:
      const nextState={
        ...state
      }
      return nextState
    case 'CHANGE_THEME':
      return {...state, theme: action?.payload};
    case 'REDUX_THEME':
      return {...state, redux_theme: action?.payload};
    case 'CUSTOM':
      return {...state,...action?.payload}
    default:
      return {...state};
  }
};

export default rootReducer;