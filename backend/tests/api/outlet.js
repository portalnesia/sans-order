const request = require('supertest');

describe("Outlet Endpoint",()=>{
  describe("Authenticated",()=>{
    it("Create Outlet", async() => {
      const resp = await request(strapi.server.httpServer)
        .post("/api/outlets")
        .send({data:{name:"Test",toko:1}})
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(200);
    });
  
    it("Find Outlet", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/outlets/1")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(200);
      expect(resp?.body?.data?.name).toBe('Test')
    });
  
    it("Find All Test Outlets", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/tokos/test/outlets")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken);
        
      expect(resp.statusCode).toBe(200);
      expect(resp?.body?.data?.[0]?.name).toBe('Test')
    });
  })


  describe("Public",()=>{
    it("FindOne", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/outlets/1")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        
      expect(resp.statusCode).toBe(200);
      expect(resp?.body?.data?.name).toBe('Test')
    });
  
    it("Create Outlet Failed", async() => {
      const resp = await request(strapi.server.httpServer)
        .post("/api/outlets")
        .send({data:{name:"Test",toko:1}})
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json');
  
      expect(resp.statusCode).toBe(403);
    });
  })
})