const request = require('supertest');
const dayjs = require('dayjs')

describe("Promo Endpoint",()=>{
  describe("Authenticated",()=>{
    it("Create Promo Failed", async() => {
      const resp = await request(strapi.server.httpServer)
        .post("/api/promos/1")
        .send({data:{amount:10000}})
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(400);
    });

    it("Create Promo", async() => {
      const now = dayjs();
      const resp = await request(strapi.server.httpServer)
        .post("/api/promos/1")
        .send({data:{name:"Test Create",amount:10000,type:'fixed',active:true,from:now.toDate(),to:now.add(7,'day').toDate(),products:[1]}})
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(200);
    });
  
    it("Find All Promo", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/promos/1")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(200);
      expect(resp?.body?.data?.[0]?.name).toBe('Test Create')
      expect(resp?.body?.data?.[0]?.type).toBe('fixed')
    });

    it("Update Promo", async() => {
      const now = dayjs();
      const resp = await request(strapi.server.httpServer)
        .put("/api/promos/1/1")
        .send({data:{name:"Test",amount:10000,type:'fixed',active:true,from:now.toDate(),to:now.add(7,'day').toDate(),products:[1]}})
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(200);
    });
  
    it("Find All Promo Updated", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/promos/1")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + jwtToken)
        
      expect(resp.statusCode).toBe(200);
      expect(resp?.body?.data?.[0]?.name).toBe('Test')
      expect(resp?.body?.data?.[0]?.type).toBe('fixed')
    });
  })


  describe("Public",()=>{
    it("Find Failed", async() => {
      const resp = await request(strapi.server.httpServer)
        .get("/api/promos/1")
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        
      expect(resp.statusCode).toBe(200);
      expect(resp?.body?.data?.[0]?.name).toBe('Test')
      expect(resp?.body?.data?.[0]?.type).toBe('fixed')
    });
  
    it("Create Promo Failed", async() => {
      const resp = await request(strapi.server.httpServer)
        .post("/api/promos/1")
        .send({data:{name:"Test"}})
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json');
  
      expect(resp.statusCode).toBe(403);
    });
  })
})