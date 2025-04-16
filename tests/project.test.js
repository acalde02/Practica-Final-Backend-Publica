const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");

jest.setTimeout(15000);

let token = "";
let companyCreated = false;
let clientId = "";
let projectId = "";

beforeAll(async () => {
  // Login como admin
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "user25@test.com", password: "HolaMundo.01" });

  token = loginRes.body.token;
  expect(token).toBeDefined();

  // Crear compañía
  const companyRes = await request(app)
    .patch("/api/company")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Empresa Test QA",
      cif: "QA000001",
      street: "Calle QA",
      number: 1,
      postal: 28000,
      city: "Madrid",
      province: "Madrid"
    });

  expect(companyRes.status).toBe(200);
  companyCreated = true;

  // Registrar cliente
  const clientRes = await request(app)
    .post("/api/client/register")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Cliente Test QA",
      street: "Cliente St",
      number: 100,
      postal: 28001,
      city: "Madrid",
      province: "Madrid",
      phone: "600000001",
      email: "clientqa@test.com",
      role: "cliente"
    });

  expect(clientRes.status).toBe(200);
  clientId = clientRes.body._id || clientRes.body.data?._id;
});

afterAll(async () => {
  // Eliminar cliente (hard delete)
  if (clientId) {
    await request(app)
      .delete(`/api/client/${clientId}`)
      .query({ soft: false })
      .set("Authorization", `Bearer ${token}`);
  }

  // Eliminar compañía (hard delete)
  if (companyCreated) {
    await request(app)
      .delete("/api/company")
      .query({ soft: false })
      .set("Authorization", `Bearer ${token}`);
  }

  await mongoose.disconnect();
});

describe("Project API", () => {
  it("should create a new project", async () => {
    const res = await request(app)
      .post("/api/project")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Proyecto Test",
        description: "Descripción del proyecto",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        client: clientId,
      });

    expect([200, 409]).toContain(res.status);
    if (res.status === 200) {
      projectId = res.body._id || res.body.data?._id;
      expect(projectId).toBeDefined();
    }
  });

  it("should retrieve the created project", async () => {
    const res = await request(app)
      .get(`/api/project/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body._id || res.body.data?._id).toBe(projectId);
  });

  it("should soft delete the project", async () => {
    const res = await request(app)
      .delete(`/api/project/${projectId}`)
      .query({ soft: true })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("should not retrieve the soft-deleted project", async () => {
    const res = await request(app)
      .get(`/api/project/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("should recover the soft-deleted project", async () => {
    const res = await request(app)
      .put(`/api/project/recover/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("should hard delete the project", async () => {
    const res = await request(app)
      .delete(`/api/project/${projectId}`)
      .query({ soft: false })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});