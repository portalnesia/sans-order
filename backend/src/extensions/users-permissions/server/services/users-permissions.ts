import usersPermission from '@strapi/plugin-users-permissions/server/services/users-permissions';
import _ from 'lodash'
import urlJoin from 'url-join'

const transformRoutePrefixFor = pluginName => route => {
  const prefix = route.config && route.config.prefix;
  const path = prefix !== undefined ? `${prefix}${route.path}` : `/${pluginName}${route.path}`;

  return {
    ...route,
    path,
  };
};

export default ({strapi}) =>{
  const ori = usersPermission({strapi});

  return {
    ...ori,
    async getRoutes() {
      const routesMap = {};
  
      _.forEach(strapi.api, (api, apiName) => {
        const routes = _.flatMap(api.routes, route => {
          if (_.has(route, 'routes')) {
            return route.routes;
          }
  
          return route;
        }).filter(route => route?.info?.type === 'content-api');
  
        if (routes.length === 0) {
          return;
        }
  
        const apiPrefix = strapi.config.get('api.rest.prefix');
        routesMap[`api::${apiName}`] = routes.map(route => ({
          ...route,
          path: urlJoin(apiPrefix, route.path),
        }));
      });
  
      _.forEach(strapi.plugins, (plugin, pluginName) => {
        const transformPrefix = transformRoutePrefixFor(pluginName);
  
        const routes = _.flatMap(plugin.routes, route => {
          if (_.has(route, 'routes')) {
            return route.routes.map(transformPrefix);
          }
  
          return transformPrefix(route);
        }).filter(route => route.info.type === 'content-api');
  
        if (routes.length === 0) {
          return;
        }
  
        const apiPrefix = strapi.config.get('api.rest.prefix');
        routesMap[`plugin::${pluginName}`] = routes.map(route => ({
          ...route,
          path: urlJoin(apiPrefix, route.path),
        }));
      });
  
      return routesMap;
    },
  }
}