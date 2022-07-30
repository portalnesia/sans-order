const request = require('supertest');

describe("Toko Endpoint",()=>{
  describe("Authenticated",()=>{
    it("FindAll", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/tokos")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        .expect('Content-Type', /json/)
  
      expect(resp.statusCode).toBe(200);
    });
  
    it("Create", async() => {
      const resp = await request(strapi.server.httpServer)
        .post("/api/tokos")
        .send({data:{name:"Test"}})
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        .expect('Content-Type', /json/);
      
      expect(resp.statusCode).toBe(200);
    });
  
    it("FindOne", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/tokos/test")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken);
      
      expect(resp.statusCode).toBe(200);
      expect(resp?.body?.data?.name).toBe('Test')
    });
  })
  

  describe("Public",()=>{
    it("FindOne", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/tokos/test")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        
      expect(resp.statusCode).toBe(200);
      expect(resp?.body?.data?.name).toBe('Test')
    });
    it("FindAll Notfound", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/tokos")
      
      expect(resp.statusCode).toBe(404);
    });
  })
})