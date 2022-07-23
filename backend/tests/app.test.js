const { setupStrapi, cleanupStrapi } = require("./helpers/strapi");

jest.setTimeout(500000)
beforeAll(async () => {
  await setupStrapi();
});

afterAll(async () => {
  await cleanupStrapi();
});

describe("SansOrder Test",()=>{
  it("strapi is defined", () => {
    expect(strapi).toBeDefined();
  });

  require('./api/toko')
  require('./api/outlet')
})
