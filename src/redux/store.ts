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
import { photoUrl } from '@utils/Main';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations'
import nextI18nextConfig from '@rootnext-i18next.config';
import { SSRConfig } from 'next-i18next';

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
  notfound?:boolean
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
type Callback<P=IPages> = (params: CallbackParams<P>)=>Promise<GetServerSidePropsResult<P>>

async function getTranslation(translation?: string|string[],locale: string='en') {
  const translations = translation ? ['menu','common'].concat(typeof translation === 'string' ? [translation] : translation) : ['menu','common'];
  return await serverSideTranslations(locale,translations,nextI18nextConfig)
}

export default function wrapper<P=IPages>(callback?: Callback<P>|IQuery) {
    // @ts-ignore
    return wrapperRoot.getServerSideProps((store)=>async(ctx)=>{
        let props: IPages = {}
        try {
          const userid = ctx.req.cookies?.['_so_token_'];
          async function checkOutlet(dt: IOutlet = {},translation?:string|string[]): Promise<GetServerSidePropsResult<P>> {
            dt.notfound=dt.notfound||true;
            if(!userid && dt.onlyMyToko) return db.redirect<P>("/apps");
            const toko_id = ctx.params?.toko_id;
            const outlet_id = ctx.params?.outlet_id;
            if(typeof toko_id !== 'string' || typeof outlet_id !== 'string') return db.redirect<P>(!dt.notfound ? "/apps" : undefined);
            const toko = await db.kata(`SELECT o.*, tk.userid,tk.slug,tk.name as toko_name FROM ${db.prefix}${process.env.DB_OUTLET_TABLE} o LEFT JOIN ${db.prefix}${process.env.DB_TOKO_TABLE} tk ON tk.id = o.toko_id WHERE o.id=? AND tk.slug=? LIMIT 1`,[outlet_id,toko_id]);
            
            if(!toko) return db.redirect<P>(!dt.notfound ? "/apps" : undefined);
            const isOwner = toko[0].userid == userid;
            //return {props:{err:1818} as unknown as P}
            //if((dt.onlyAdmin||dt.onlyMyToko||dt.onlyOwner) && toko?.[0]?.online !== null) return {props:{err:1818} as unknown as P}

            if(dt.onlyOwner) {
              if(!isOwner) return db.redirect<P>(!dt.notfound ? "/apps" : undefined);
            } else if(dt.onlyMyToko && !isOwner) {
              const users = await db.get('toko_users',{userid,toko_id:toko[0].toko_id,outlet_id:toko[0].id,pending:0},{limit:1});
              if(!users) return db.redirect<P>(!dt.notfound ? "/apps" : undefined);

              if(dt.onlyAdmin && !users.admin) return db.redirect<P>(!dt.notfound ? "/apps" : undefined);
            }
            
            return {
              props:{
                meta:{
                  title:toko[0]?.name,
                  description: convertToPlaintext(toko[0]?.description),
                  slug: toko[0]?.slug,
                  toko_name: toko[0]?.toko_name,
                  image: `${photoUrl(toko[0]?.logo||null)}&watermark=no&export=banner&size=300`
                },
                ...(await getTranslation(translation,ctx.locale))
              } as unknown as P,
            }
          }

          async function checkToko(dt: IOutlet = {},translation?:string|string[]): Promise<GetServerSidePropsResult<P>> {
            dt.notfound=dt.notfound||true;
            const toko_id = ctx.params?.toko_id;
            if(typeof toko_id !== 'string') return db.redirect();
            let check: Record<string, any> | undefined;

            if(dt.onlyMyToko) {
              if(!userid) return db.redirect("/apps");
              check = await db.get(process.env.DB_TOKO_TABLE as string,{slug:toko_id,userid:userid},{limit:1});
            } else {
              check = await db.get(process.env.DB_TOKO_TABLE as string,{slug:toko_id},{limit:1});
            }
            if(!check) return db.redirect(!dt.notfound ? "/apps" : undefined);
            
            return {
              props :{
                meta:{
                  title:check?.name,
                  description:convertToPlaintext(check?.description),
                  slug: check?.slug,
                  image: `${photoUrl(check?.logo||null)}&watermark=no&export=banner&size=300`
                },
                ...(await getTranslation(translation,ctx.locale))
              } as unknown as P
            }
          }

          async function checkTransactions(dt: IOutlet = {},translation?:string|string[]): Promise<GetServerSidePropsResult<P>> {
            const slug = ctx.params?.slug;
            if(typeof slug !== 'string') return db.redirect();
            const check = await db.get(process.env.DB_TR_TABLE as string,"id=? AND (type='self_order' OR type='withdraw')",{limit:1},[slug]);
            if(!check) return db.redirect();

            if(check?.type === 'withdraw' && check?.userid != userid) return db.redirect();

            return {
              props :{
                meta:{
                  slug: check?.id
                },
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
          const result = await callback({store,redirect:db.redirect,checkToko,checkOutlet,getTranslation,...ctx})
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


export function staticProps(config?: Pick<IQuery,'translation'>){
  return async(ctx: GetStaticPropsContext)=>{
    return {
      props:{
        ...(await getTranslation(config?.translation,ctx.locale))
      },
    };
  }
}