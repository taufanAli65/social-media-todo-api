const request = require("supertest");
const express = require("express");
const authRouter = require("../api/routes/auth");
const contentRouter = require("../api/routes/content");
const { db } = require("../api/firebase-config");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use("/auth", authRouter);
app.use("/content", contentRouter);

let createdUserID;

describe("POST /auth/register", () => {
  it("should register a new user and set user roles to employee", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: "test@example.com",
        password: "password123",
        name: "Test User"
      });
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("Success");
    expect(response.body.message).toContain("Successfully created new User");

    createdUserID = response.body.message.split(": ")[1];
    const userDoc = await db.collection("users").doc(createdUserID).get();
    expect(userDoc.exists).toBe(true);
    expect(userDoc.data().roles).toBe("employee");
  });

  it("should return an error if registration fails", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: "invalid-email",
        password: "short",
        name: "Test User"
      });
    expect(response.status).toBe(500);
    expect(response.body.status).toBe("Internal Server Error");
  });
});

describe("POST /auth/login", () => {
  it("should login an admin user", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("idToken");
  });
});

describe("GET /content", () => {
  it("should get all contents", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
    const idToken = loginResponse.body.idToken;

    const response = await request(app)
      .get("/content")
      .set("Authorization", `Bearer ${idToken}`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("Success");
    expect(response.body.contents).toBeInstanceOf(Array);
  });
});

describe("POST /content", () => {
  it("should add new content", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
    const idToken = loginResponse.body.idToken;

    const newContent = {
      title: "New Content",
      brand: "Brand A",
      platform: "Platform X",
      payment: 100
    };
    const response = await request(app)
      .post("/content")
      .set("Authorization", `Bearer ${idToken}`)
      .send(newContent);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("Success");
    expect(response.body.content).toMatchObject(newContent);
  });

  it("should return an error if required fields are missing", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
    const idToken = loginResponse.body.idToken;

    const response = await request(app)
      .post("/content")
      .set("Authorization", `Bearer ${idToken}`)
      .send({ title: "Incomplete Content" });
    expect(response.status).toBe(500);
    expect(response.body.status).toBe("Internal Server Error");
  });
});

afterAll(async () => {
  const response = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
  const idToken = response.body.idToken;

  await request(app)
    .post(`/auth/delete/${createdUserID}`)
    .set("Authorization", `Bearer ${idToken}`)
    .send();

    const contents = db.collection("contents");
    const snapshot = await contents.get();
    snapshot.forEach(async (doc) => {
        await doc.ref.delete();
    }); // delete entire collection
});
