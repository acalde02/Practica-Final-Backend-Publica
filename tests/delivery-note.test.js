const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const path = require("path");

jest.setTimeout(15000);

let token = "";
let companyCreated = false;
let clientId = "";
let projectId = "";
let deliveryNoteId = "";
let signedDeliveryNoteId = "";

beforeAll(async () => {
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "user25@test.com", password: "HolaMundo.01" });

  token = loginRes.body.token;
  expect(token).toBeDefined();

  const companyRes = await request(app)
    .patch("/api/company")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Empresa Test QA",
      cif: "QA000002",
      street: "Calle QA",
      number: 2,
      postal: 28000,
      city: "Madrid",
      province: "Madrid"
    });

  expect([200, 409]).toContain(companyRes.status);
  companyCreated = true;

  const clientRes = await request(app)
    .post("/api/client/register")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Cliente QA Albaran",
      street: "Cliente Calle",
      number: 200,
      postal: 28002,
      city: "Madrid",
      province: "Madrid",
      phone: "600000002",
      email: "clientqa-albaran@test.com",
      role: "cliente"
    });

  expect(clientRes.status).toBe(200);
  clientId = clientRes.body._id || clientRes.body.data?._id;

  const projectRes = await request(app)
    .post("/api/project")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Proyecto Albaran",
      description: "Proyecto asociado al test de albaranes",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      client: clientId,
    });

  expect(projectRes.status).toBe(200);
  projectId = projectRes.body._id || projectRes.body.data?._id;
});

afterAll(async () => {
  if (deliveryNoteId) {
    await request(app)
      .delete(`/api/delivery-note/${deliveryNoteId}?soft=false`)
      .set("Authorization", `Bearer ${token}`);
  }

  if (signedDeliveryNoteId) {
    await request(app)
      .delete(`/api/delivery-note/${signedDeliveryNoteId}?soft=false`)
      .set("Authorization", `Bearer ${token}`);
  }

  if (projectId) {
    await request(app)
      .delete(`/api/project/${projectId}?soft=false`)
      .set("Authorization", `Bearer ${token}`);
  }

  if (clientId) {
    await request(app)
      .delete(`/api/client/${clientId}?soft=false`)
      .set("Authorization", `Bearer ${token}`);
  }

  if (companyCreated) {
    await request(app)
      .delete("/api/company")
      .query({ soft: false })
      .set("Authorization", `Bearer ${token}`);
  }

  await mongoose.disconnect();
});

describe("Delivery Note API", () => {
  it("should fail if format is missing", async () => {
    const res = await request(app)
      .post("/api/delivery-note")
      .set("Authorization", `Bearer ${token}`)
      .send({ projectId, hours: 5 });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("should create a valid delivery note with 'hours' format (for signing)", async () => {
    const res = await request(app)
      .post("/api/delivery-note")
      .set("Authorization", `Bearer ${token}`)
      .send({
        projectId,
        format: "hours",
        hours: 4,
        description: "Electric maintenance",
      });

    expect(res.status).toBe(201);
    signedDeliveryNoteId = res.body.data._id;
  });

  it("should create a valid delivery note with 'material' format (for deletion)", async () => {
    const res = await request(app)
      .post("/api/delivery-note")
      .set("Authorization", `Bearer ${token}`)
      .send({
        projectId,
        format: "material",
        material: "Wood",
        quantity: 15,
        description: "Material delivery",
      });

    expect(res.status).toBe(201);
    deliveryNoteId = res.body.data._id;
  });

  it ("should generate PDF for delivery note", async () => {
    const res = await request(app)
      .get(`/api/delivery-note/pdf/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.pdfUrl).toMatch(/^https?:\/\//); // URL válida
    expect(res.body.message).toBe("PDF generated and uploaded successfully");

    });

  it("should upload signature and generate PDF for signed note", async () => {
    const res = await request(app)
      .patch(`/api/delivery-note/sign/${signedDeliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("file", path.join(__dirname, "fixtures", "firma-test.jpg"));

    expect(res.status).toBe(200);
    expect(res.body.data.pdf).toMatch(/^https?:\/\//);
  });

  it("should soft delete the delivery note", async () => {
    const res = await request(app)
      .delete(`/api/delivery-note/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/soft-deleted|soft deleted/i);
  });

  it("should return 404 when accessing a deleted delivery note", async () => {
    const res = await request(app)
      .get(`/api/delivery-note/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("should restore the delivery note", async () => {
    const res = await request(app)
      .patch(`/api/delivery-note/restore/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(deliveryNoteId);
  });

  it("should hard delete the delivery note", async () => {
    const res = await request(app)
      .delete(`/api/delivery-note/${deliveryNoteId}?soft=false`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/permanently deleted/i);
  });

  it("should fail to restore a permanently deleted delivery note", async () => {
    const res = await request(app)
      .patch(`/api/delivery-note/restore/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});