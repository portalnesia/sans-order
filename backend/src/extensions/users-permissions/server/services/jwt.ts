import jwt,{VerifyOptions} from 'jsonwebtoken'
import jwtOri from '@strapi/plugin-users-permissions/server/services/jwt'
import _ from 'lodash'

const CustomJwt = ({strapi})=> {
  const ori = jwtOri({strapi});

  return {
    ...ori,
    verify(token: string,option: VerifyOptions = {}) {
      return new Promise(function(resolve, reject) {
        _.defaults(option, strapi.config.get('plugin.users-permissions.jwt'));
        jwt.verify(token, strapi.config.get('plugin.users-permissions.jwtSecret'),option, function(
          err,
          tokenPayload = {}
        ) {
          if (err) {
            return reject(new Error('Invalid token.'));
          }
          resolve(tokenPayload);
        });
      });
    },

  }
}

export default CustomJwt;