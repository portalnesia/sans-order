import { createStore, applyMiddleware, Dispatch,Store } from 'redux'
import thunk from 'redux-thunk'
import {createWrapper} from 'next-redux-wrapper';
import rootReducer from './reducers/root';
import {State,ActionType} from './types'
import {IPages} from '@type/general'
//import crypto from 'portal/utils/crypto'
import db from '@utils/db'
import {GetServerSidePropsContext,GetServerSidePropsResult,GetStaticPropsContext,GetStaticPropsResult} from 'next'
import { ParsedUrlQuery } from 'querystring'
import {useDispatch as originalUseDispatch,useSelector as originalUseSelector} from 'react-redux'
import {convertToPlaintext} from '@utils/marked'

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

type IOutlet = {
  onlyAdmin?: boolean,
  onlyOwner?: boolean,
  onlyMyToko?: boolean,
  onlyLogin?:boolean
}

type IQuery = {
    name:'check_toko'|'check_outlet',
    outlet?: IOutlet
}

type CallbackParams<P> = GetServerSidePropsContext<ParsedUrlQuery,any> & ({store: Store<State, ActionType> & {
    dispatch: Dispatch<ActionType>;
}}) & ({
    redirect(urlOrNotFound?:string): GetServerSidePropsResult<P>,
    checkToko(): Promise<GetServerSidePropsResult<P>>,
    checkOutlet(data?: IOutlet): Promise<GetServerSidePropsResult<P>>,
})
type Callback<P=IPages> = (params: CallbackParams<P>)=>Promise<GetServerSidePropsResult<P>>

export default function wrapper<P=IPages>(callback?: Callback<P>|IQuery) {
    // @ts-ignore
    return wrapperRoot.getServerSideProps((store)=>async(ctx)=>{
        let props: IPages = {}
        try {
          const userid = ctx.req.cookies?.['_so_token_'];

          async function checkOutlet(dt: IOutlet = {}): Promise<GetServerSidePropsResult<P>> {
            dt.onlyLogin = true;
            if(!userid && dt.onlyLogin) return db.redirect<P>("/apps");
            const toko_id = ctx.params?.toko_id;
            const outlet_id = ctx.params?.outlet_id;
            if(typeof toko_id !== 'string' || typeof outlet_id !== 'string') return db.redirect<P>("/apps");
            const toko = await db.kata(`SELECT o.*, tk.userid,tk.slug,tk.name as toko_name FROM ${db.prefix}toko_outlet o LEFT JOIN ${db.prefix}toko tk ON tk.id = o.toko_id WHERE o.id=? AND tk.slug=? LIMIT 1`,[outlet_id,toko_id]);

            if(!toko) return db.redirect<P>("/apps");
            const isOwner = toko[0].userid == userid;
            
            if(dt.onlyOwner) {
              if(!isOwner) return db.redirect<P>("/apps");
            } else if(!isOwner) {
              const users = await db.get('toko_users',{userid,toko_id:toko[0].toko_id,outlet_id:toko[0].id,pending:0},{limit:1});
              if(!users) return db.redirect<P>("/apps");

              if(dt.onlyAdmin && !users.admin) return db.redirect<P>("/apps");
            }
            
            return {
              props:{
                meta:{
                  title:toko[0]?.name,
                  description: convertToPlaintext(toko[0]?.description),
                  slug: toko[0]?.slug,
                  toko_name: toko[0]?.toko_name
                }
              } as unknown as P
            }
          }

          async function checkToko(): Promise<GetServerSidePropsResult<P>> {
            if(!userid) return db.redirect("/apps");

            const toko_id = ctx.params?.toko_id;
            
            if(typeof toko_id !== 'string') return db.redirect();
            const check = await db.get('toko',{slug:toko_id,userid:userid},{limit:1});
            if(!check) return db.redirect();
            
            return {
              props :{
                meta:{
                  title:check?.name,
                  description:convertToPlaintext(check?.description),
                  slug: check?.slug
                }
              } as unknown as P
            }
          }

          if(!callback) return {props};
          if(typeof callback === 'object') {
            
            //console.log(userid,props.req.cookies)
            if(callback.name === 'check_toko') {
              return await checkToko();
            }
            if(callback.name === 'check_outlet') {
              return await checkOutlet(callback.outlet)
            }

            return {props}
          }
          const result = await callback({store,redirect:db.redirect,checkToko,checkOutlet,...ctx})
          return result
        } catch(err) {
          console.log(err)
          if(ctx.res) {
              ctx.res.statusCode=503;
              ctx.res.setHeader('Retry-After',3600);
          }
          throw err;
          //return {
            //props:({err:503} as unknown as P)
          //}
        }
  })
}

export function staticProps(){
  return async()=>{
    return {props:{}};
  }
}