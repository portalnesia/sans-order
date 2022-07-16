import schema from "./server/content-types/file";
import contentApi from "./server/controllers/content-api"
import contentApiRoutes from "./server/routes/content-api"
import upload from "./server/services/upload";

export default (plugin: any) => {
  plugin.controllers['content-api'] = contentApi

  plugin.routes['content-api'] = contentApiRoutes;

  plugin.contentTypes.file = schema

  plugin.services.upload = upload

  return plugin;
}