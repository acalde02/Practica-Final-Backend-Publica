const request = require("supertest");
const app = require("../app");

jest.setTimeout(10000);

describe("Company and Guest User Flow", () => {
  let adminToken;
  let guestId;

  const guestData = {
    name: "Guest User",
    surnames: "Test",
    nif: "99999999Z",
    email: "guest@test.com",
    password: "GuestPass.01"
  };

  beforeAll(async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "user25@test.com",
        password: "HolaMundo.01"
      });

    adminToken = loginRes.body.token;

    await request(app)
      .patch("/api/user/company")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Fake Company",
        cif: "A12345678",
        street: "Calle Falsa",
        number: 123,
        postal: 28080,
        city: "Madrid",
        province: "Madrid",
        phone: "600000000"
      })
      .expect(200);
  });

  it("should register a guest user", async () => {
    const res = await request(app)
      .post("/api/user/guest")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(guestData)
      .expect(200);

    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(guestData.email);
    guestId = res.body.user._id;
  });

  it("should soft delete the guest", async () => {
    const res = await request(app)
      .delete(`/api/user/${guestId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.message).toContain("USER_SOFT_DELETED");
  });

  it("should not see the guest in user list", async () => {
    const res = await request(app)
      .get(`/api/user/${guestId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(403);

    expect(res.text).toContain("USER_DELETED");
  });

  it("should restore the guest", async () => {
    const res = await request(app)
      .patch(`/api/user/restore/${guestId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.message).toContain("USER_RESTORED_BY_ADMIN");
  });

  it("should hard delete the guest", async () => {
    const res = await request(app)
      .delete(`/api/user/${guestId}?soft=false`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.message).toContain("User deleted successfully");
  });
});
