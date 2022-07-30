import schemaConfig from '@strapi/plugin-users-permissions/server/content-types/user/schema-config'

export default {
  collectionName: 'up_users',
  info: {
    name: 'user',
    description: '',
    singularName: 'user',
    pluralName: 'users',
    displayName: 'User',
  },
  options: {
    draftAndPublish: false,
    timestamps: true,
  },
  attributes: {
    name:{
      type: 'string',
      minLength: 3,
      configurable: false,
      required: true
    },
    username: {
      type: 'string',
      minLength: 3,
      unique: true,
      configurable: false,
      required: true,
    },
    picture:{
      type: 'string',
      configurable: false,
      required: false
    },
    email: {
      type: 'email',
      minLength: 6,
      configurable: false,
      required: true,
    },
    telephone: {
      type: 'string',
      configurable: false,
      required: false
    },
    provider: {
      type: 'string',
      configurable: false,
    },
    password: {
      type: 'password',
      minLength: 6,
      configurable: false,
      private: true,
    },
    resetPasswordToken: {
      type: 'string',
      configurable: false,
      private: true,
    },
    confirmationToken: {
      type: 'string',
      configurable: false,
      private: true,
    },
    confirmed: {
      type: 'boolean',
      default: false,
      configurable: false,
    },
    blocked: {
      type: 'boolean',
      default: false,
      configurable: false,
    },
    admin: {
      type: 'boolean',
      default: false,
      configurable: false,
      private: true,
    },
    role: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.role',
      inversedBy: 'users',
      configurable: false,
    },
  },

  config: schemaConfig, // TODO: to move to content-manager options
};