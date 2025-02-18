const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const authRouter = require("../api/routes/auth");
const axios = require("axios");
const {db} = require("../api/firebase-config");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use("/auth", authRouter);

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
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.API_KEY}`,
      {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        returnSecureToken: true
      }
    );
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("idToken");
  });
});

afterAll(async () => {
  const response = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.API_KEY}`,
    {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      returnSecureToken: true
    }
  );
  const idToken = response.data.idToken;

  await request(app)
    .post(`/auth/delete/${createdUserID}`)
    .set("Authorization", `Bearer ${idToken}`)
    .send();
});
