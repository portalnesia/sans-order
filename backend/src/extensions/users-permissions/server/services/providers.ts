import { Strapi } from "@strapi/strapi"
import jwt from 'jsonwebtoken'
import providersOri from '@strapi/plugin-users-permissions/server/services/providers'
import _ from 'lodash'

function getProfile({ query }: any) {
  const idToken = query.id_token;
  const tokenPayload = jwt.decode(idToken);
  if (!tokenPayload) {
    throw new Error('unable to decode jwt token');
  } else {
    return {
      username: tokenPayload['username'],
      email: tokenPayload['email'],
      name: tokenPayload['name'],
      picture: tokenPayload['picture'],
      id: tokenPayload['sub'],
      telephone: tokenPayload?.['telephone']
    };
  }
}

export default ({strapi}: {strapi: Strapi})=>{
  const ori = providersOri({strapi});
  const connect= async(provider: string, query: any) => {
    if(provider !== 'portalnesia') return ori.connect(provider,query);

    const access_token = query.access_token || query.code || query.oauth_token;

    if (!access_token) {
      throw new Error('Error: No access_token.');
    }

    const profile = getProfile({query});

    const email = _.toLower(profile.email);

    if (!email) {
      throw new Error('Email was not available.');
    }

    const users = await strapi.query('plugin::users-permissions.user').findMany({
      where: { email },
    });

    // @ts-ignore
    const advancedSettings = await strapi.store({ type: 'plugin', name: 'users-permissions', key: 'advanced' }).get();

    const user = _.find(users, { provider });

    if (_.isEmpty(user) && !advancedSettings.allow_register) {
      throw new Error('Register action is actually not available.');
    }

    if (!_.isEmpty(user)) {
      const {id:_,...rest} = profile

      // @ts-ignore
      await strapi.entityService.update('plugin::users-permissions.user',user.id,{data:rest})
      return user;
    }

    if (users.length > 1 && advancedSettings.unique_email) {
      throw new Error('Email is already taken.');
    }

    const defaultRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: advancedSettings.default_role } });

    // Create the new user.
    const newUser = {
      ...profile,
      email, // overwrite with lowercased email
      provider,
      role: defaultRole.id,
      confirmed: true,
    };

    const createdUser = await strapi
      .query('plugin::users-permissions.user')
      .create({ data: newUser });

    return createdUser;
  }

  return {
    connect,
    buildRedirectUri: ori.buildRedirectUri,
  };
}