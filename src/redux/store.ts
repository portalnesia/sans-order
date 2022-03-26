import { createStore, applyMiddleware, Dispatch,Store } from 'redux'
import thunk from 'redux-thunk'
import {createWrapper} from 'next-redux-wrapper';
import rootReducer from './reducers/root';
import {State,ActionType} from './types'
//import crypto from 'portal/utils/crypto'
import dayjs from 'dayjs'
//import db from 'portal/utils/db'
import {isTrue} from '@portalnesia/utils'
import {GetServerSidePropsContext,GetServerSidePropsResult,GetStaticPropsContext,GetStaticPropsResult} from 'next'
import { ParsedUrlQuery } from 'querystring'
import {useDispatch as originalUseDispatch,useSelector as originalUseSelector} from 'react-redux'

export const useDispatch = ()=>originalUseDispatch<Dispatch<ActionType>>()
export const useSelector = <D=State>(selector: (state: State)=>D)=>originalUseSelector<State,D>(selector)

export const makeStore = () => {
  const store = createStore<State,ActionType,{dispatch:Dispatch<ActionType>},{}>(rootReducer, applyMiddleware(thunk));

  if ((module as any).hot) {
      (module as any).hot.accept('./reducers/root', () => {
          store.replaceReducer(require('./reducers/root').default);
      });
  }

  return store;
};

export const wrapperRoot = createWrapper(makeStore);

type CallbackParams = GetServerSidePropsContext<ParsedUrlQuery,any> & ({store: Store<State, ActionType> & {
  dispatch: Dispatch<ActionType>;
}}) & ({
  redirect<P>(urlOrNotFound?:string): GetServerSidePropsResult<P>
})

type Callback<P> = (params: CallbackParams)=>Promise<GetServerSidePropsResult<P>>

function redirect<P>(destination?:string){
  if(destination) {
      if(process.env.NODE_ENV==='production') {
          return {
              redirect: {
                  destination,
                  permanent:false
              }
          } as GetServerSidePropsResult<P>
      } else {
          console.log("DEVELOPER REDIRECT",destination);
          return {
              notFound:true
          } as GetServerSidePropsResult<P>
      }
  } else {
      return {
          notFound:true
      } as GetServerSidePropsResult<P>
  }
}

export default function wrapper<P>(callback?: Callback<P>|'login'|'admin') {
  return wrapperRoot.getServerSideProps((store)=>async(props)=>{
      try {
          if(!callback) return {
              props:({} as unknown as P)
          }
          if(typeof callback === 'string') {
              
            return {
              props:({} as unknown as P)
            }
          }
          const result = await callback({store,redirect,...props})
          return result
      } catch(err) {
          console.log(err)
          if(props.res) {
              props.res.statusCode=503;
              props.res.setHeader('Retry-After',3600);
          }
          return {
              props:({err:503} as unknown as P)
          }
      }
  })
}

export function staticProps(){
    return async({locale}: GetStaticPropsContext)=>{
        return {
            props: {
              // You can get the messages from anywhere you like. The recommended
              // pattern is to put them in JSON files separated by language and read
              // the desired one based on the `locale` received from Next.js.
              messages: (await import(`../../locale/${locale}.json`)).default
            }
          };
    }
}