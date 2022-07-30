import bootstrap from "./server/bootstrap"
import user from "./server/content-types/user";
import providers from "./server/services/providers";
import usersPermissions from "./server/services/users-permissions";
import getJwtFromRefreshToken, { callback } from "./server/controllers/auth";
import CustomJwt from "./server/services/jwt";

export default (plugin) => {
  plugin.bootstrap = bootstrap;

  plugin.contentTypes.user = {
    schema: user
  };

  plugin.services.providers = providers;
  plugin.services['users-permissions'] = usersPermissions

  plugin.services['jwt'] = CustomJwt

  plugin.routes['content-api'].routes.push({
    method: 'POST',
    path: '/auth/refresh',
    handler: 'auth.refresh',
    config: {
      middlewares: ['plugin::users-permissions.rateLimit'],
      prefix: '',
    },
  })

  plugin.controllers.auth.callback = callback
  plugin.controllers.auth.refresh = getJwtFromRefreshToken

  return plugin;
}