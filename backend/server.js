const command = process.env.NODE_ENV === 'production' ? 'start' : 'develop';
const resolveCwd = require('resolve-cwd');

const cmdPath = require.resolve(`@strapi/strapi/lib/commands/${command}`);

const script = require(cmdPath);

script({}).catch(console.error)