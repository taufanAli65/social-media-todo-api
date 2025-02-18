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
let contentID;

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
    contentID = response.body.id;
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

describe("POST /assign/:contentID/:userID", () => {
  it("should assign content to a user", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
    const idToken = loginResponse.body.idToken;
    const response = await request(app)
      .post(`/content/assign/${contentID}/${createdUserID}`)
      .set("Authorization", `Bearer ${idToken}`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("Success");
    expect(response.body.message).toContain("Content successfully assigned");
  });

  it("should return an error if user does not exist", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
    const idToken = loginResponse.body.idToken;

    const response = await request(app)
      .post(`/content/assign/${contentID}/nonexistentUserID`)
      .set("Authorization", `Bearer ${idToken}`);
    expect(response.status).toBe(404);
    expect(response.body.status).toBe("User not found");
  });

  it("should return an error if content does not exist", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
    const idToken = loginResponse.body.idToken;

    const response = await request(app)
      .post(`/content/assign/nonexistentContentID/${createdUserID}`)
      .set("Authorization", `Bearer ${idToken}`);
    expect(response.status).toBe(404);
    expect(response.body.status).toBe("Content not found");
  });

  it("should return an error if user is already assigned", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
    const idToken = loginResponse.body.idToken;
    
    const response = await request(app)
      .post(`/content/assign/${contentID}/${createdUserID}`)
      .set("Authorization", `Bearer ${idToken}`);
    expect(response.status).toBe(400);
    expect(response.body.status).toBe("User or Content already assigned");
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
    .delete(`/auth/delete/${createdUserID}`)
    .set("Authorization", `Bearer ${idToken}`)
    .send();

    const contents = db.collection("contents").doc(contentID);
    await contents.delete();
});
