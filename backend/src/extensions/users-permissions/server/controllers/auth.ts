import Utils, { getService } from '@strapi/plugin-users-permissions/server/utils/index'
import type { Context } from 'koa';
import utils from '@strapi/utils'
import Validation from '@strapi/plugin-users-permissions/server/controllers/validation/auth'
import _ from 'lodash'
import { getDayJs } from '../../../../../utils/Main';

const { ApplicationError, ValidationError } = utils.errors;
const { sanitize } = utils;

const sanitizeUser = (user: any, ctx: Context) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel('plugin::users-permissions.user');

  return sanitize.contentAPI.output(user, userSchema, { auth });
};

export async function callback(ctx: Context) {

  const provider = ctx.params.provider || 'local';
  const params = ctx.request.body;
  // @ts-ignore
  const store = strapi.store({ type: 'plugin', name: 'users-permissions' });
  const grantSettings = await store.get({ key: 'grant' });

  const grantProvider = provider === 'local' ? 'email' : provider;

  if (!_.get(grantSettings, [grantProvider, 'enabled'])) {
    throw new ApplicationError('This provider is disabled');
  }

  if (provider === 'local') {
    await Validation.validateCallbackBody(params);

    const { identifier } = params;

    // Check if the user exists.
    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: {
        provider,
        $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
      },
    });

    if (!user) {
      throw new ValidationError('Invalid identifier or password');
    }

    if (!user.password) {
      throw new ValidationError('Invalid identifier or password');
    }

    const validPassword = await Utils.getService('user').validatePassword(
      params.password,
      user.password
    );

    if (!validPassword) {
      throw new ValidationError('Invalid identifier or password');
    }

    const advancedSettings = await store.get({ key: 'advanced' });
    const requiresConfirmation = _.get(advancedSettings, 'email_confirmation');

    if (requiresConfirmation && user.confirmed !== true) {
      throw new ApplicationError('Your account email is not confirmed');
    }

    if (user.blocked === true) {
      throw new ApplicationError('Your account has been blocked by an administrator');
    }

    return ctx.send({
      jwt: Utils.getService('jwt').issue({ id: user.id }),
      refresh: Utils.getService('jwt').issue({ id: user.id },{expiresIn:'14d',subject:'refresh_token'}),
      expired: getDayJs().add(1,'week').unix(),
      user: await sanitizeUser(user, ctx),
    });
  }

  // Connect the user with the third-party provider.
  try {
    const user = await Utils.getService('providers').connect(provider, ctx.query);

    return ctx.send({
      jwt: Utils.getService('jwt').issue({ id: user.id }),
      refresh: Utils.getService('jwt').issue({ id: user.id },{expiresIn:'14d',subject:'refresh_token'}),
      expired: getDayJs().add(1,'week').unix(),
      user: await sanitizeUser(user, ctx),
    });
  } catch (error) {
    throw new ApplicationError(error.message);
  }
}

export default async function getJwtFromRefreshToken(ctx: Context) {
  try {
    const {id} = getService('jwt').verify(ctx.request.body?.refresh||'',{subject:'refresh_token'});

    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: {
        id:{
          $eq: id
        }
      },
    });

    if (!user) {
      throw new ValidationError('Invalid identifier or password');
    }

    return ctx.send({
      jwt: getService('jwt').issue({ id: user.id }),
      refresh: Utils.getService('jwt').issue({ id: user.id },{expiresIn:'14d',subject:'refresh_token'}),
      expired: getDayJs().add(1,'week').unix(),
      user: await sanitizeUser(user, ctx),
    });
  } catch {
    ctx.unauthorized("Invalid refresh token")
  }
}