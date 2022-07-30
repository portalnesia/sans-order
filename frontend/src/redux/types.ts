//import {AccessToken} from 'simple-oauth2'
import { PortalnesiaUser } from '@portalnesia/portalnesia-strapi';
import { ISocket } from '@utils/Socket';
import {HYDRATE} from 'next-redux-wrapper';

export type {PortalnesiaUser}

export type State = {
  theme:'auto'|'light'|'dark',
  redux_theme:'light'|'dark',
  user: PortalnesiaUser | false | null,
  appToken: string | null,
  ready: boolean,
  socket: ISocket|null,
  report: Record<string,any>|null
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