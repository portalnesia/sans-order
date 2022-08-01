const request = require('supertest');

describe("Product Endpoint",()=>{
  describe("Authenticated",()=>{
    it("Create Product Failed", async() => {
      const resp = await request(strapi.server.httpServer)
        .post("/api/products/1")
        .send({data:{price:10000}})
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(400);
    });

    it("Create Product", async() => {
      const resp = await request(strapi.server.httpServer)
        .post("/api/products/1")
        .send({data:{name:"Test Create",price:10000,hpp:5000,active:true,show_in_menu:true}})
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(200);
    });
  
    it("Find All Product", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/products/1")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(200);
      expect(resp?.body?.data?.[0]?.name).toBe('Test Create')
      expect(resp?.body?.data?.[0]?.price).toBe(10000)
    });

    it("Update Product", async() => {
      const resp = await request(strapi.server.httpServer)
        .put("/api/products/1/1")
        .send({data:{name:"Test",price:10000,hpp:5000,active:true,show_in_menu:true}})
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(200);
    });
  
    it("Find All Product Updated", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/products/1")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(200);
      expect(resp?.body?.data?.[0]?.name).toBe('Test')
      expect(resp?.body?.data?.[0]?.price).toBe(10000)
    });

    it("Find All Product for Cashier", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/products/1/cashier")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(200);
      expect(resp?.body?.data?.[0]?.name).toBe('Test')
      expect(resp?.body?.data?.[0]?.price).toBe(10000)
    });
  })


  describe("Public",()=>{
    it("Find Failed", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/products/1")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        
      expect(resp.statusCode).toBe(403);
    });
  
    it("Create Product Failed", async() => {
      const resp = await request(strapi.server.httpServer)
        .post("/api/products/1")
        .send({data:{name:"Test"}})
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json');
  
      expect(resp.statusCode).toBe(403);
    });

    it("Find Menu Products", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/products/1/menu")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        
      expect(resp.statusCode).toBe(200);
      expect(resp?.body?.data?.[0]?.category).toBe('Uncategory')
      expect(resp?.body?.data?.[0]?.data?.[0]?.name).toBe('Test')
      expect(resp?.body?.data?.[0]?.data?.[0]?.price).toBe(10000)
    });
  })
})