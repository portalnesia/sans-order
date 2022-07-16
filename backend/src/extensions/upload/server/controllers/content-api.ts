import type {Context} from 'koa'
import _ from 'lodash';
import utils from '@strapi/utils';
import { getService } from '@strapi/plugin-upload/server/utils';
import { FILE_MODEL_UID } from '@strapi/plugin-upload/server/constants';
import validateUploadBody from '@strapi/plugin-upload/server/controllers/validation/content-api/upload';
import { Outlet } from '../../../../../types/Outlet';
import Transform from '@strapi/strapi/lib/core-api/controller/transform'
import { Toko } from '../../../../../types/Toko';


const { sanitize } = utils;
const { ValidationError } = utils.errors;

const sanitizeOutput = (data, ctx) => {
  const schema = strapi.getModel(FILE_MODEL_UID);
  const { auth } = ctx.state;

  return sanitize.contentAPI.output(data, schema, { auth });
};

const createFolderMerchant = () => {
  
}

const getFolderMerchant = () => {

}

export default {
  async find(ctx: Context) {
    const {toko_id} = ctx.params;
    const user = ctx.state.user;
    //const user = await strapi.entityService.findOne<'plugin::users-permissions.user',User>('plugin::users-permissions.user',2,{})
    if(!user) return ctx.forbidden();

    const apiUploadFolderService = getService('api-upload-folder');
    await apiUploadFolderService.getAPIUploadFolder();

    const toko = await strapi.entityService.findMany('api::toko.toko',{filters:{slug:{$eq:toko_id}},populate:'user'})

    if(!toko || toko.length !== 1) return ctx.notFound("Merchant not found");

    const {results,pagination} = await getService('upload').findPage({...ctx.query,filters:{
      // @ts-ignore
      ...ctx.query.filters,
      toko:{
        id:{
          $eq:toko[0].id
        }
      }
    }});

    const sanitize = await sanitizeOutput(results, ctx);
    return Transform.transformResponse(sanitize,{pagination});
  },

  async findOne(ctx: Context) {
    const {
      params: { id,toko_id },
    } = ctx;

    const user = ctx.state.user;
    //const user = await strapi.entityService.findOne<'plugin::users-permissions.user',User>('plugin::users-permissions.user',2,{})
    if(!user) return ctx.forbidden();

    const toko = await strapi.entityService.findMany('api::toko.toko',{filters:{slug:{$eq:toko_id}},populate:'user'})

    if(!toko || toko.length !== 1) return ctx.notFound("Merchant not found");

    const file = await getService('upload').findOne(id,{
      filters:{
        toko:{
          id:{
            $eq:toko[0].id
          }
        }
      }
    });

    if (!file) {
      return ctx.notFound('file.notFound');
    }

    const sanitize = await sanitizeOutput(file, ctx);
    return Transform.transformResponse(sanitize);
  },

  async destroy(ctx: Context) {
    const {
      params: { id,toko_id },
    } = ctx;

    const user = ctx.state.user;
    if(!user) return ctx.forbidden();

    const toko = await strapi.entityService.findMany('api::toko.toko',{filters:{slug:{$eq:toko_id}},populate:'user'})

    if(!toko || toko.length !== 1) return ctx.notFound("Merchant not found");

    const file = await getService('upload').findOne(id,{filters:{
      toko:{
        id:{
          $eq:toko[0].id
        }
      }}
    });

    if (!file) {
      return ctx.notFound('file.notFound');
    }

    await getService('upload').remove(file);

    const sanitize = await sanitizeOutput(file, ctx);
    return Transform.transformResponse(sanitize);
  },

  async updateFileInfo(ctx: Context,outlet: Outlet) {
    const {
      query: { id },
      // @ts-ignore
      request: { body },
    } = ctx;
    const data = await validateUploadBody(body);
    data.fileInfo = data.fileInfo || {};
    data.fileInfo = Array.isArray(data.fileInfo) ? data.fileInfo : [data.fileInfo];
    data.fileInfo.forEach(fileInfo => {
      fileInfo.outlet = outlet.id
    });

    const result = await getService('upload').updateFileInfo(id, data.fileInfo);

    const sanitize = await sanitizeOutput(result, ctx);
    return Transform.transformResponse(sanitize);
  },

  async replaceFile(ctx: Context,toko: Toko) {
    const {
      query: { id },
      // @ts-ignore
      request: { body, files: { files } = {} },
    } = ctx;

    // cannot replace with more than one file
    if (Array.isArray(files)) {
      throw new ValidationError('Cannot replace a file with multiple ones');
    }

    const data = await validateUploadBody(body);
    data.fileInfo = data.fileInfo || {};
    data.fileInfo = Array.isArray(data.fileInfo) ? data.fileInfo : [data.fileInfo];
    data.fileInfo.forEach(fileInfo => {
      fileInfo.toko = toko.id
    });

    const replacedFiles = await getService('upload').replace(id, {
      data,
      file: files,
    });

    const sanitize = await sanitizeOutput(replacedFiles, ctx);
    return Transform.transformResponse(sanitize);
  },

  async uploadFiles(ctx: Context,toko: Toko) {
    const {
      // @ts-ignore
      request: { body, files: { files } = {} },
    } = ctx;

    const data = await validateUploadBody(body);

    const apiUploadFolderService = getService('api-upload-folder');

    const apiUploadFolder = await apiUploadFolderService.getAPIUploadFolder();
    data.fileInfo = data.fileInfo || {};
    data.fileInfo = Array.isArray(data.fileInfo) ? data.fileInfo : [data.fileInfo];
    data.fileInfo.forEach(fileInfo => {
      fileInfo.folder = apiUploadFolder.id
      fileInfo.toko = toko.id
    });

    const uploadedFiles = await getService('upload').upload({
      data,
      files,
    });

    const sanitize = await sanitizeOutput(uploadedFiles, ctx);
    return Transform.transformResponse(sanitize);
  },

  async upload(ctx: Context) {
    const {
      query: { id },
      params: {toko_id},
      // @ts-ignore
      request: { files: { files } = {} },
    } = ctx;

    const user = ctx.state.user;
    if(!user) return ctx.forbidden();

    const toko = await strapi.entityService.findMany('api::toko.toko',{filters:{slug:{$eq:toko_id}},populate:'user'})

    if(!toko || toko.length !== 1) return ctx.notFound("Merchant not found");

    if (_.isEmpty(files) || files.size === 0) {
      if (id) {
        return this.updateFileInfo(ctx);
      }

      throw new ValidationError('Files are empty');
    }

    return await (id ? this.replaceFile : this.uploadFiles)(ctx,toko[0]);
  },
}