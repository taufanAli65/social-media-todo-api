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
const uniqueEmail = `test${Date.now()}@example.com`;

describe("POST /auth/register", () => {
  it("should register a new user and set user roles to employee", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: uniqueEmail,
        password: "password123",
        name: "Test User"
      });
    console.log(response.body); // Add logging
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
    console.log(response.body); // Add logging
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
    console.log(response.body); // Add logging
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
    console.log(response.body); // Add logging
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("Success");
    expect(response.body.contents).toBeInstanceOf(Array);
  });

  it("should return no contents if user has no assigned contents", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: uniqueEmail,
        password: "password123"
      });
    const idToken = loginResponse.body.idToken;

    const response = await request(app)
      .get("/content")
      .set("Authorization", `Bearer ${idToken}`);
    console.log(response.body); // Add logging
    expect(response.status).toBe(404);
    expect(response.body.status).toBe("No Contents");
  });
});

describe("GET /content/user/:userID", () => {
  it("should get contents assigned to a user", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
    const idToken = loginResponse.body.idToken;

    const response = await request(app)
      .get(`/content/user/${process.env.ASSIGNED_USERID}`)
      .set("Authorization", `Bearer ${idToken}`);
    console.log(response.body); // Add logging
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("Success");
    expect(response.body.contents).toBeInstanceOf(Array);
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
      .get(`/content/user/nonexistentUserID`)
      .set("Authorization", `Bearer ${idToken}`);
    console.log(response.body); // Add logging
    expect(response.status).toBe(404);
    expect(response.body.status).toBe("User not found");
  });
});

describe("GET /content/all/:status", () => {
  it("should get contents by status", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
    const idToken = loginResponse.body.idToken;

    const response = await request(app)
      .get("/content/all/done")
      .set("Authorization", `Bearer ${idToken}`);
    console.log(response.body); // Add logging
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("Success");
    expect(response.body.contents).toBeInstanceOf(Array);
  });

  it("should return an error for invalid status", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
    const idToken = loginResponse.body.idToken;

    const response = await request(app)
      .get("/content/all/invalid-status")
      .set("Authorization", `Bearer ${idToken}`);
    console.log(response.body); // Add logging
    expect(response.status).toBe(400);
    expect(response.body.status).toBe("Invalid status parameter");
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
    console.log(response.body); // Add logging
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
    console.log(response.body); // Add logging
    expect(response.status).toBe(500);
    expect(response.body.status).toBe("Internal Server Error");
  });
});

describe("POST /assign", () => {
  it("should assign content to a user", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
    const idToken = loginResponse.body.idToken;
    const response = await request(app)
      .post(`/content/assign`)
      .set("Authorization", `Bearer ${idToken}`)
      .send({
        userID: process.env.ASSIGNED_USERID,
        contentID: contentID
      });
    console.log(response.body); // Add logging
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
      .post(`/content/assign`)
      .set("Authorization", `Bearer ${idToken}`)
      .send({
        userID: "nonexistentUserID",
        contentID: contentID
      });
    console.log(response.body); // Add logging
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
      .post(`/content/assign`)
      .set("Authorization", `Bearer ${idToken}`)
      .send({
        userID: createdUserID,
        contentID: "nonexistentContentID"
      });
    console.log(response.body); // Add logging
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
      .post(`/content/assign`)
      .set("Authorization", `Bearer ${idToken}`)
      .send({
        userID: createdUserID,
        contentID: contentID
      });
    console.log(response.body); // Add logging
    expect(response.status).toBe(400);
    expect(response.body.status).toBe("User or Content already assigned");
  });
});

describe("PUT /content/reassign", () => {
  it("should reassign content to a different user", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
    const idToken = loginResponse.body.idToken;

    const response = await request(app)
      .put("/content/reassign")
      .set("Authorization", `Bearer ${idToken}`)
      .send({
        userID: createdUserID,
        contentID: contentID
      });
    console.log(response.body); // Add logging
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("Success");
    expect(response.body.message).toContain("Content successfully re-assigned");
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
      .put("/content/reassign")
      .set("Authorization", `Bearer ${idToken}`)
      .send({
        userID: "nonexistentUserID",
        contentID: contentID
      });
    console.log(response.body); // Add logging
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
      .put("/content/reassign")
      .set("Authorization", `Bearer ${idToken}`)
      .send({
        userID: process.env.ASSIGNED_USERID,
        contentID: "nonexistentContentID"
      });
    console.log(response.body); // Add logging
    expect(response.status).toBe(404);
    expect(response.body.status).toBe("Content not found");
  });
});

describe("PUT /content/", () => {
  it("should update the status of a content", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: uniqueEmail,
        password: "password123"
      });
    const idToken = loginResponse.body.idToken;

    const response = await request(app)
      .put("/content/")
      .set("Authorization", `Bearer ${idToken}`)
      .send({
        userID: createdUserID,
        contentID: contentID,
        status: "done"
      });
    console.log("Request payload:", {
      userID: createdUserID,
      contentID: contentID,
      status: "done"
    }); // Add detailed logging
    console.log("Response body:", response.body); // Add detailed logging
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("Success");
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
      .put("/content/")
      .set("Authorization", `Bearer ${idToken}`)
      .send({
        userID: "nonexistentUserID",
        contentID: contentID,
        status: "done"
      });
    console.log("Request payload:", {
      userID: "nonexistentUserID",
      contentID: contentID,
      status: "done"
    }); // Add detailed logging
    console.log("Response body:", response.body); // Add detailed logging
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
      .put("/content/")
      .set("Authorization", `Bearer ${idToken}`)
      .send({
        userID: createdUserID,
        contentID: "nonexistentContentID",
        status: "done"
      });
    console.log("Request payload:", {
      userID: createdUserID,
      contentID: "nonexistentContentID",
      status: "done"
    }); // Add detailed logging
    console.log("Response body:", response.body); // Add detailed logging
    expect(response.status).toBe(404);
    expect(response.body.status).toBe("Content not found");
  });

  it("should return an error if user is not authorized to update the content", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
    const idToken = loginResponse.body.idToken;

    const response = await request(app)
      .put("/content/")
      .set("Authorization", `Bearer ${idToken}`)
      .send({
        userID: process.env.ASSIGNED_USERID,
        contentID: contentID,
        status: "done"
      });
    console.log("Request payload:", {
      userID: process.env.ASSIGNED_USERID,
      contentID: contentID,
      status: "done"
    }); // Add detailed logging
    console.log("Response body:", response.body); // Add detailed logging
    expect(response.status).toBe(404);
    expect(response.body.status).toBe("User not authorized to update this content");
  });
});

describe("GET /content/:contentID", () => {
  it("should get content by ID", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });
    const idToken = loginResponse.body.idToken;

    const response = await request(app)
      .get(`/content/${contentID}`)
      .set("Authorization", `Bearer ${idToken}`);
    console.log(response.body); // Add logging
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("Success");
    expect(response.body.content).toHaveProperty("title");
  });

  it("should return an error if content does not exist", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });
    const idToken = loginResponse.body.idToken;

    const response = await request(app)
      .get(`/content/nonexistentContentID`)
      .set("Authorization", `Bearer ${idToken}`);
    console.log(response.body); // Add logging
    expect(response.status).toBe(404);
    expect(response.body.status).toBe("Content not found");
  });
});

describe("DELETE /content/:contentID", () => {
  it("should delete a content", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });
    const idToken = loginResponse.body.idToken;

    const response = await request(app)
      .delete(`/content/${contentID}`)
      .set("Authorization", `Bearer ${idToken}`);
    console.log(response.body); // Add logging
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("Success");
    expect(response.body.message).toContain("deleted successfully");

    const contentDoc = await db.collection("contents").doc(contentID).get();
    expect(contentDoc.exists).toBe(false);
  });

  it("should return an error if content does not exist", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });
    const idToken = loginResponse.body.idToken;

    const response = await request(app)
      .delete(`/content/nonexistentContentID`)
      .set("Authorization", `Bearer ${idToken}`);
    console.log(response.body); // Add logging
    expect(response.status).toBe(404);
    expect(response.body.status).toBe("Content not found");
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

  await db.collection("contents").doc(contentID).delete();
});