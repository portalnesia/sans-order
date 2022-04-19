//import {AccessToken} from 'simple-oauth2'
import {HYDRATE} from 'next-redux-wrapper';

export type IUser = {
  picture: string|null,
  email: string,
  /**
   * USER_ID
   */
  sub: number,
  username: string,
  name: string
}

export type State = {
  theme:'auto'|'light'|'dark',
  redux_theme:'light'|'dark',
  user: IUser | false | null,
  appToken: string | null,
  ready: boolean
}

export type ActionType = {
  type: typeof HYDRATE,
  payload: Partial<State>
} | {
  type: 'CHANGE_THEME',
  payload: State['theme']
} | {
  type: 'REDUX_THEME',
  payload: State['redux_theme']
} | {
  type:'CUSTOM',
  payload: Partial<State>
}