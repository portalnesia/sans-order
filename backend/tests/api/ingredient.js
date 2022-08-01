const request = require('supertest');

describe("Ingredient Endpoint",()=>{
  describe("Authenticated",()=>{
    it("Create Ingredient Failed", async() => {
      const resp = await request(strapi.server.httpServer)
        .post("/api/ingredients/1")
        .send({data:{name:"Test"}})
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(400);
    });

    it("Create Ingredient", async() => {
      const resp = await request(strapi.server.httpServer)
        .post("/api/ingredients/1")
        .send({data:{name:"Test Create",unit:"ml"}})
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(200);
    });
  
    it("Find All Ingredient", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/ingredients/1")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(200);
      expect(resp?.body?.data?.[0]?.name).toBe('Test Create')
      expect(resp?.body?.data?.[0]?.unit).toBe('ml')
    });

    it("Update Ingredient", async() => {
      const resp = await request(strapi.server.httpServer)
        .put("/api/ingredients/1/1")
        .send({data:{name:"Test",unit:"ml"}})
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(200);
    });

    it("Find All Ingredient Updated", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/ingredients/1")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(200);
      expect(resp?.body?.data?.[0]?.name).toBe('Test')
      expect(resp?.body?.data?.[0]?.unit).toBe('ml')
    });
  })


  describe("Public",()=>{
    it("Find Failed", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/ingredients/1")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        
      expect(resp.statusCode).toBe(403);
    });
  
    it("Create Ingredient Failed", async() => {
      const resp = await request(strapi.server.httpServer)
        .post("/api/ingredients/1")
        .send({data:{name:"Test",toko:1}})
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json');
  
      expect(resp.statusCode).toBe(403);
    });
  })
})