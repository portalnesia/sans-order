import type { QueryFromContentType,EntityManager } from '@strapi/database';
import type { Context } from 'koa';
import type { IO } from '../src/utils/socket';
import type { NestedKeys,Params,ServiceParams } from './General';
import { LifecycleProvider } from '@strapi/database/lib/lifecycles';
import { MigrationProvider } from '@strapi/database/lib/migrations';
import { SchemaProvideer } from '@strapi/database/lib/schema';

interface CustomQueryFromContentType<T,K> extends QueryFromContentType<T> {
  sum(params: any,field?: keyof K): Promise<number>;
}

type Pagination = {
  page: number,
  pageSize: number,
  pageCount:number,
  total: number
} 

interface Database {
  schema: SchemaProvideer;
  lifecycles: LifecycleProvider;
  migrations: MigrationProvider;
  entityManager: EntityManager;

  query<T extends keyof AllTypes,K extends AllTypes[T]>(uid: T): CustomQueryFromContentType<T,K>;
}

interface BaseService {
  getFetchParams?(params: object): object;
}

interface SingleTypeService<K extends keyof AllTypes,T extends AllTypes[K]> extends BaseService {
  find?(params: Params<T>): Promise<T>;
  createOrUpdate?(params: Params<T>): Promise<T|null>;
  delete?(params: Params<T>): Promise<T>;
}

interface CollectionTypeService<K extends keyof AllTypes,T extends AllTypes[K]> extends BaseService<K,T> {
  find?(params: ServiceParams<T>): Promise<{results:T[],pagination: Pagination}>;
  findOne?(entityId: string|number,params: Params<T>): Promise<T|null>;
  create?(params: Params<T>): Promise<T>;
  update?(entityId: string|number,params: Params<T>): Promise<T>;
  /**
   * Delete Collection
   * @param {string|number} entityId Collection ID
   * @param {Params<T>} params Parameters
   * @return {Promise<T>} Deleted collection
   */
  delete?(entityId: string|number,params: Params<T>): Promise<T>;
}

type ServiceEntity<K,P> = CollectionTypeService<K,P> | SingleTypeService<K,P>;
type CoreService<K,P> = K extends keyof GlobalSingleService ? SingleTypeService<K,P> : CollectionTypeService<K,P>

interface CustomEntityService {
  uploadFiles<K extends keyof AllTypes, T extends AllTypes[K]>(uid: K, entity, files);
  wrapParams<K extends keyof AllTypes, T extends AllTypes[K]>(
    params: Params<T>,
    { uid: K, action: EntityServiceAction }
  );
  findMany<K extends keyof AllTypes, T extends AllTypes[K]>(
    uid: K,
    params: Params<T>
  ): Promise<T[]>;
  findPage<K extends keyof AllTypes, T extends AllTypes[K]>(
    uid: K,
    params: Params<T>
  ): Promise<{
    results: T[];
    pagination: PaginationInfo;
  }>;
  findWithRelationCountsPage<K extends keyof AllTypes, T extends AllTypes[K]>(
    uid: K,
    params: Params<T>
  ): Promise<{
    results: T[];
    pagination: PaginationInfo;
  }>;
  findWithRelationCounts<K extends keyof AllTypes, T extends AllTypes[K]>(
    uid: K,
    params: Params<T>
  ): Promise<T[]>;
  findOne<K extends keyof AllTypes, T extends AllTypes[K]>(
    uid: K,
    entityId: ID,
    params: Params<T>
  ): Promise<T>;
  count<K extends keyof AllTypes, T extends AllTypes[K]>(uid: K, params: Params<T>): Promise<number>;
  create<K extends keyof AllTypes, T extends AllTypes[K]>(uid: K, params: Params<T>): Promise<T>;
  update<K extends keyof AllTypes, T extends AllTypes[K]>(
    uid: K,
    entityId: ID,
    params: Params<T>
  ): Promise<T>;
  /**
   * Delete Collection
   * @param {K} uid Collection Unique Name
   * @param {string|number} entityId Collection ID
   * @param {Params<T>} params Parameters
   * @return {Promise<T>} Deleted collection
   */
  delete<K extends keyof AllTypes, T extends AllTypes[K]>(
    uid: K,
    entityId: ID,
    params: Params<T>
  ): Promise<T>;
}

module '@strapi/strapi' {
  export declare namespace factories {
    interface Controller {
      transformResponse(data: object, meta: object): object;
      sanitizeOutput(data: object, ctx: Context): Promise<object>;
      sanitizeInput(data: object, ctx: Context): Promise<object>;
    }

    type GenericController = Partial<Controller> & {
      [method: string | number | symbol]: (ctx: Context) => unknown;
    };
    
    type HandlerConfig = {
      auth?: false | { scope: string[] };
      policies?: Array<string | Policy>;
      middlewares?: Array<string | Middleware>;
    };
  
    type SingleTypeRouterConfig = {
      find?: HandlerConfig;
      update?: HandlerConfig;
      delete?: HandlerConfig;
    };
  
    type CollectionTypeRouterConfig = {
      find?: HandlerConfig;
      findOne?: HandlerConfig;
      create?: HandlerConfig;
      update?: HandlerConfig;
      delete?: HandlerConfig;
    };
  
    type RouterConfigs = {
      prefix?: string;
      only?: string[];
      except?: string[];
      config?: SingleTypeRouterConfig | CollectionTypeRouterConfig;
    };
  
    interface Route {
      method: string;
      path: string;
    }
    interface Router {
      prefix: string;
      routes: Route[];
    }

    type ControllerCallback <T extends GenericController = GenericController> = (params:{strapi:Strapi}) => T;
    type ServiceCallbacks <T,P> = (params:{strapi:Strapi}) => T & P

    export function createCoreRouter(uid: string, cfg?: RouterConfigs = {}): () => Router;
    export function createCoreService<K extends keyof Service,T extends Service[K],P extends AllTypes[K]>(uid: K, cfg?: ServiceCallbacks<T,CoreService<K,P>> | T = {}): () => T & Required<CoreService<K,P>>;
  }

  
  export interface Strapi {
    entityService: CustomEntityService
    db: Database
    $io: IO
    service<K extends keyof Service,T extends Service[K],P extends AllTypes[K]>(uid: K): T & Required<CoreService<K,P>>;
  }
}