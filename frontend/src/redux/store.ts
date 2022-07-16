import { createStore, applyMiddleware, Dispatch,Store } from 'redux'
import thunk from 'redux-thunk'
import {createWrapper} from 'next-redux-wrapper';
import rootReducer from './reducers/root';
import {State,ActionType} from './types'
import {IPages} from '@type/general'
//import crypto from 'portal/utils/crypto'
import {GetServerSidePropsContext,GetServerSidePropsResult,GetStaticPropsContext,GetStaticPropsResult} from 'next'
import { ParsedUrlQuery } from 'querystring'
import {useDispatch as originalUseDispatch,useSelector as originalUseSelector} from 'react-redux'
import {convertToPlaintext} from '@utils/marked'
import { getUserAccess, photoUrl } from '@utils/Main';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations'
import nextI18nextConfig from '@rootnext-i18next.config';
import { SSRConfig } from 'next-i18next';
import { IUserAccess, Outlet, Toko, Transaction } from '@type/index';
import portalnesia from '@utils/api';
import qs from 'qs'

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

function redirect<P>(destination?:string){
  if(destination) {
      if(process.env.NODE_ENV!=='development') {
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

type IOutlet = {
  onlyOwner?: boolean,
  onlyMyToko?: boolean,
  withWallet?: boolean,
  notfound?:boolean,
  onlyAccess?: IUserAccess[]
}

type IQuery = {
    name:'check_toko'|'check_outlet'|'check_transactions',
    outlet?: IOutlet,
    translation?: string|string[]
}

type CallbackParams<P> = GetServerSidePropsContext<ParsedUrlQuery,any> & ({store: Store<State, ActionType> & {
    dispatch: Dispatch<ActionType>;
}}) & ({
    redirect(urlOrNotFound?:string): GetServerSidePropsResult<P>,
    checkToko(data?:IOutlet,translation?:string|string[]): Promise<GetServerSidePropsResult<P>>,
    checkOutlet(data?:IOutlet,translation?:string|string[]): Promise<GetServerSidePropsResult<P>>,
    getTranslation(translation?: string|string[],locale?: string): Promise<SSRConfig>
})
type Callback<P=IPages<any,false>> = (params: CallbackParams<P>)=>Promise<GetServerSidePropsResult<P>>

async function getTranslation(translation?: string|string[],locale: string='en') {
  const translations = translation ? ['menu','common'].concat(typeof translation === 'string' ? [translation] : translation) : ['menu','common'];
  return await serverSideTranslations(locale,translations,nextI18nextConfig)
}

export default function wrapper<P=IPages<any,false>>(callback?: Callback<P>|IQuery) {
  // @ts-ignore
  return wrapperRoot.getServerSideProps((store)=>async(ctx)=>{
    const token = portalnesia.getToken(ctx.req.cookies?.[portalnesia.options.store.key]);
    let props: IPages<any,false> = {}
    try {
      const userid = token?.user?.id;
      
      async function checkOutlet(dt: IOutlet = {},translation?:string|string[]): Promise<GetServerSidePropsResult<P>> {
        dt.notfound=dt.notfound||true;
        if(!userid && dt.onlyMyToko) return redirect<P>("/apps");
        const toko_id = ctx.params?.toko_id;
        const outlet_id = ctx.params?.outlet_id;
        if(typeof toko_id !== 'string' || typeof outlet_id !== 'string') return redirect<P>(!dt.notfound ? "/apps" : undefined);

        const data = await portalnesia.request<Outlet>('get',`/outlets/${outlet_id}${dt.withWallet ? '?with_wallet=true':''}`);
        if(data.error) return redirect<P>(!dt.notfound ? "/apps" : undefined);
        const outlet = data.data;
        if(!outlet) return redirect<P>(!dt.notfound ? "/apps" : undefined);
        
        const isOwner = Boolean(!userid || outlet.toko?.user?.id == userid);
        
        if(dt.onlyOwner) {
          if(!userid || outlet.toko?.user?.id != userid) return redirect<P>(!dt.notfound ? "/apps" : undefined); 
        } else if((dt.onlyMyToko || dt.onlyAccess) && !isOwner) {
          if(!userid) return redirect<P>(!dt.notfound ? "/apps" : undefined); 
          const users = outlet?.users?.find(d=>d.user?.id == userid && d.pending === false);
          if(!users) return redirect<P>(!dt.notfound ? "/apps" : undefined);

          if(dt.onlyAccess) {
            const access = users.roles.map(d=>d.name);
            if(!getUserAccess(access as IUserAccess[],dt.onlyAccess)) return redirect<P>(!dt.notfound ? "/apps" : undefined); 
          }
        }

        return {
          props:{
            meta:data,
            ...(await getTranslation(translation,ctx.locale))
          } as unknown as P,
        }
      }

      async function checkToko(dt: IOutlet = {},translation?:string|string[]): Promise<GetServerSidePropsResult<P>> {
        dt.notfound=dt.notfound||true;
        const toko_id = ctx.params?.toko_id;
        if(typeof toko_id !== 'string') return redirect();

        const data = await portalnesia.request<Toko>('get',`/tokos/${toko_id}`);
        if(data.error  || !data.data) return redirect<P>(!dt.notfound ? "/apps" : undefined);
        const toko = data.data;

        if(dt.onlyMyToko) {
          if(!userid) return redirect<P>(!dt.notfound ? "/apps" : undefined);
          if(toko.user?.id != userid) return redirect<P>(!dt.notfound ? "/apps" : undefined);
        }
        
        return {
          props :{
            meta:data,
            ...(await getTranslation(translation,ctx.locale))
          } as unknown as P
        }
      }

      async function checkTransactions(dt: IOutlet = {},translation?:string|string[]): Promise<GetServerSidePropsResult<P>> {
        const slug = ctx.params?.slug;
        if(typeof slug !== 'string') return redirect();
        
        const data = await portalnesia.request<Transaction>('get',`/transactions/${slug}`);
        if(!data.data || data.error) return redirect();

        return {
          props :{
            meta:data,
            ...(await getTranslation(translation,ctx.locale))
          } as unknown as P
        }
      }

      if(!callback) return {props};
      if(typeof callback === 'object') {
        //console.log(userid,props.req.cookies)
        if(callback.name === 'check_toko') {
          return await checkToko({},callback.translation);
        }
        if(callback.name === 'check_outlet') {
          return await checkOutlet(callback.outlet,callback.translation)
        }
        if(callback.name === 'check_transactions') {
          return await checkTransactions(callback.outlet,callback.translation)
        }
        return {props}
      }
      const result = await callback({store,redirect:redirect,checkToko,checkOutlet,getTranslation,...ctx})
      return result
    } catch(err: any) {
      console.log(err)
      if(ctx.res) {
          ctx.res.statusCode=err?.error?.status||503;
          ctx.res.setHeader('Retry-After',3600);
      }
      throw err;
    }
  })
}

type CallbackStaticParams = GetStaticPropsContext<ParsedUrlQuery,any> & ({
  getTranslation(translation?: string|string[],locale?: string): Promise<SSRConfig>
})
type CallbackStatic<P=IPages<any,false>> = (params: CallbackStaticParams)=>Promise<GetStaticPropsResult<P>>

export function staticProps<P=IPages<any,false>>(config?: CallbackStatic<P>|Pick<IQuery,'translation'>){
  return async(ctx: GetStaticPropsContext)=>{
    let props = {props:{}} as any

    if(typeof config ==='object' && config?.translation) {
      props = {
        props: {
          ...props.props,
          ...(await getTranslation(config?.translation,ctx.locale))
        },
      }
    } else if(typeof config === 'function') {
      props = await config({getTranslation,...ctx})
    }

    return props;
  }
}