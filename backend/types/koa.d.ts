import type { ParsedUrlQuery } from 'querystring';
import type { User } from './User'
import type { Outlet } from './Outlet';
import type { Toko } from './Toko';
import { Subcribe } from './Subcribe';
import { Support } from './Support';

module 'koa' {
  declare interface ContextDelegatedRequest {
    query: ParsedUrlQuery | Record<string,any>
  }
  declare interface ContextDelegatedResponse {
    notFound(msg?: string,detals?: any): void
    forbidden(msg?: string,detals?: any): void
    badRequest(msg?: string,detals?: any): void
  }

  namespace Application {
    interface DefaultState {
      user?: User
      outlet?: Outlet
      toko?: Toko
      subs?: Subcribe
      support?: Support
    }
    interface BaseRequest extends ContextDelegatedRequest {}
    interface BaseContext extends ContextDelegatedRequest, ContextDelegatedResponse {}
  }
  export = Application
}