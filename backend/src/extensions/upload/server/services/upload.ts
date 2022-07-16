import { getService } from '@strapi/plugin-upload/server/utils';
import path from 'path'
import crypto from 'crypto'
import utils from '@strapi/utils';
import {bytesToKbytes} from '@strapi/plugin-upload/server/utils/file'
import uploadOri from '@strapi/plugin-upload/server/services/upload'
import { Strapi } from '@strapi/strapi';

const randomSuffix = () => crypto.randomBytes(5).toString('hex');

const generateFileName = name => {
  const baseName = utils.nameToSlug(name, { separator: '_', lowercase: false });

  return `${baseName}_${randomSuffix()}`;
};

export default ({strapi}: {strapi: Strapi}) => {
  const uploads = uploadOri({strapi})
  return {
    ...uploads,
    async formatFileInfo({ filename, type, size }: any, fileInfo: any = {}, metas: any = {}) {
      // @ts-ignore
      const fileService = getService('file');
    
      const ext = path.extname(filename);
      const basename = path.basename(fileInfo.name || filename, ext);
      const usedName = fileInfo.name || filename;
    
      const entity = {
        ...fileInfo,
        name: usedName,
        alternativeText: fileInfo.alternativeText,
        caption: fileInfo.caption,
        folder: fileInfo.folder,
        folderPath: await fileService.getFolderPath(fileInfo.folder),
        hash: generateFileName(basename),
        ext,
        mime: type,
        size: bytesToKbytes(size),
      };
    
      const { refId, ref, field } = metas;
    
      if (refId && ref && field) {
        entity.related = [
          {
            id: refId,
            __type: ref,
            __pivot: { field },
          },
        ];
      }
    
      if (metas.path) {
        entity.path = metas.path;
      }
    
      if (metas.tmpWorkingDirectory) {
        entity.tmpWorkingDirectory = metas.tmpWorkingDirectory;
      }
    
      return entity;
    }
  }
}