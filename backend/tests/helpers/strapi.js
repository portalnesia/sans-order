const Strapi = require("@strapi/strapi");
const fs = require("fs");
const dayjs = require('dayjs')

let instance;

async function setPublicPermissions(newPermissions) {
  // Find the ID of the public role
  const publicRole = await strapi
    .query("plugin::users-permissions.role")
    .findOne({
      where: {
        type: "public",
      },
    });

  // Create the new permissions and link them to the public role
  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query("plugin::users-permissions.permission").create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

async function setAuthPermissions(newPermissions) {
  // Find the ID of the public role
  const publicRole = await strapi
    .query("plugin::users-permissions.role")
    .findOne({
      where: {
        type: "authenticated",
      },
    });

  // Create the new permissions and link them to the public role
  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query("plugin::users-permissions.permission").create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

async function setUser() {
  const now = dayjs();
  const mockUserData = {
    username: "tester",
    email: "tester@portalnesia.com",
    provider: "portalnesia",
    password: null,
    confirmed: true,
    blocked: false,
    name:"Tester",
    picture:null,
    admin:false
  };

  const defaultRole = await strapi.db.query('plugin::users-permissions.role').findOne({where:{type:'authenticated'}});
  const role = defaultRole ? defaultRole.id : null;

  await strapi.plugins["users-permissions"].services.user.add({
    ...mockUserData,
    role
  });

  await strapi.entityService.create('api::subcribe.subcribe',{
    data:{
      user:1,
      max_toko:1,
      max_outlet:1,
      max_user:1,
      expired:now.add(1,'h').toDate()
    }
  })

  const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
    id: 1,
  });

  global.jwtToken = jwt;
}

async function setupStrapi() {
  if (!instance) {
    await Strapi({distDir:'./dist'}).load();
    instance = strapi;

    await Promise.all([
      setPublicPermissions({
        toko: ["find", "findOne","findOutlets"],
        outlet: ["find", "findOne"],
        ingredient: ["find", "findOne"],
      }),
      setAuthPermissions({
        toko: ["find", "findOne","create","put","delete","findOutlets"],
        outlet: ["find", "findOne","create","put","delete"],
        ingredient: ["find", "findOne","create","put","delete"],
      }),
      setUser(),
      instance.server.mount()
    ])
  }
  return instance;
}

async function cleanupStrapi() {
  const dbSettings = strapi.config.get("database.connection.connection");

  //close server to release the db-file
  await strapi.destroy();

  //delete test database after all tests have completed
  if (dbSettings && dbSettings.filename) {
    const tmpDbFile = `${dbSettings.filename}`;
    
    if (fs.existsSync(tmpDbFile)) {
      fs.unlinkSync(tmpDbFile);
    }
  }

  delete global.jwtToken;
}

module.exports = { setupStrapi, cleanupStrapi };