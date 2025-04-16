const request = require("supertest");
const app = require("../app");

jest.setTimeout(10000);

describe("Client API", () => {
  let token = "";
  let clientId = "";
  let tempCompanyId = null;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "user25@test.com",
        password: "HolaMundo.01",
      });

    token = loginRes.body.token;
    expect(token).toBeDefined();

    // Verificar si el usuario ya tiene una compañía
    const profile = await request(app)
      .get("/api/user/profile")
      .set("Authorization", `Bearer ${token}`);

    if (!profile.body?.company) {
      // Crear compañía ficticia
      const companyRes = await request(app)
        .patch("/api/user/company")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Compañía Test",
          cif: "A12345678",
          street: "Calle Falsa",
          number: 123,
          postal: 28080,
          city: "Madrid",
          province: "Madrid",
          phone: "600000000",
          email: `company${Date.now()}@test.com`,
        });

        expect(companyRes.status).toBe(200);
        expect(companyRes.body.company).toBeDefined();
        tempCompanyId = companyRes.body.company._id;
    }
  });

  afterAll(async () => {
    if (tempCompanyId) {
      await request(app)
        .delete(`/api/company/?soft=false`)
        .set("Authorization", `Bearer ${token}`);
    }
  });

  it("should create a new client", async () => {
    const res = await request(app)
      .post("/api/client/register")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Cliente Ficticio",
        street: "Calle Imaginaria",
        number: 123,
        postal: 28001,
        city: "Madrid",
        province: "Madrid",
        phone: "600123456",
        email: `cliente${Date.now()}@test.com`,
        role: "cliente"
      });

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined(); 
      clientId = res.body._id;      
  });

  it("should get all clients", async () => {
    const res = await request(app)
      .get("/api/client")
      .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true); 
      
  });

  it("should soft delete the client", async () => {
    const res = await request(app)
      .delete(`/api/client/${clientId}`)
      .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("soft");  
  });

  it("should not get the soft deleted client", async () => {
    const res = await request(app)
      .get(`/api/client/${clientId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("should restore the client", async () => {
    const res = await request(app)
      .patch(`/api/client/restore/${clientId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(clientId);
  });

  it("should hard delete the client", async () => {
    const res = await request(app)
      .delete(`/api/client/${clientId}?soft=false`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("permanently");
  });
});
