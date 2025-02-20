const { db, auth } = require("../firebase-config");
const {
  getUserDoc,
  getContentDoc,
  assignDueDate,
  checkUserAuthorization,
} = require("../utils");

async function getAllContents(req, res) {
  try {
    let data = [];
    const user = await getUserDoc(req.user.uid);
    const userRoles = user.roles;
    if (userRoles === "admin") {
      const response = await db.collection("contents").get();
      response.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
    } else {
      const response = await db
        .collection("contents")
        .where("assignedTo", "==", req.user.uid)
        .get();
      response.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
    }
    if (data.length === 0) {
      return res.status(404).json({ status: "No Contents" });
    }
    res.status(200).json({ status: "Success", contents: data });
  } catch (error) {
    res.status(500).json({ status: "Internal Server Error", error: error.message });
  }
}

async function getUserAssignedContents(req, res) {
  try {
    const userID = req.params.userID;
    await getUserDoc(userID);
    let data = [];
    const user = await getUserDoc(req.user.uid);
    if (user.roles === "admin" || userID == req.user.id) {
      const response = await db
        .collection("contents")
        .where("assignedTo", "==", userID)
        .get();
      response.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
    }
    if (data.length === 0) {
      return res.status(404).json({ status: "No Contents" });
    }
    res.status(200).json({ status: "Success", contents: data });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ status: "User not found" });
    }
    res.status(500).json({ status: "Internal Server Error", error: error.message });
  }
}

async function getUserContentsByStatus(req, res) {
  try {
    let data = [];
    const status = req.params.status;
    if (
      status !== "done" &&
      status !== "on-progress" &&
      status !== "assigned" &&
      status !== "unassigned"
    ) {
      return res.status(400).json({ status: "Invalid status parameter" });
    }
    const response = await db
      .collection("contents")
      .where("status", "==", status)
      .get();
    response.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    if (data.length === 0) {
      return res.status(404).json({ status: "No Contents" });
    }
    res.status(200).json({ status: "Success", contents: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "Internal Server Error", error: error.message });
  }
}

async function addContent(req, res) {
  try {
    let contentID;
    const { title, brand, platform, payment } = req.body;
    if (!title || !brand || !platform || !payment) {
      throw new Error("Missing required fields: title, brand, platform, and/or payment");
    }
    const status = "unassigned";
    const dueDate = await assignDueDate();
    await db
      .collection("contents")
      .add({ title, brand, platform, payment, status, dueDate })
      .then((content) => {
        contentID = content.id;
      });
    res.status(200).json({
      status: "Success",
      content: { title, brand, platform, payment, status, dueDate },
      id: contentID,
    });
  } catch (error) {
    res.status(500).json({ status: "Internal Server Error", error: error.message });
  }
}

async function assignContent(req, res) {
  try {
    const { userID, contentID } = req.body;
    if (!userID || !contentID) {
      return res.status(400).json({ status: "There is no user ID or content ID given" });
    }
    await getUserDoc(userID);
    const content = await getContentDoc(contentID);
    if (content.assignedTo) {
      return res.status(400).json({ status: "User or Content already assigned" });
    }
    await db.collection("contents").doc(contentID).set(
      {
        status: "assigned",
        assignedTo: userID,
      },
      { merge: true }
    );
    await db.collection("users").doc(userID).set(
      {
        assigned: true,
      },
      { merge: true }
    );
    const userRecord = await auth.getUser(userID);
    const userName = userRecord.displayName || userRecord.uid;
    res.status(200).json({
      status: "Success",
      message: `Content successfully assigned to ${userName}`,
    });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ status: "User not found" });
    }
    if (error.message === "Content not found") {
      return res.status(404).json({ status: "Content not found" });
    }
    console.log(error);
    res.status(500).json({ status: "Internal Server Error", error: error.message });
  }
}

async function reAssignContent(req, res) {
  try {
    const { userID, contentID } = req.body;
    await getUserDoc(userID);
    await getContentDoc(contentID);
    await db.collection("contents").doc(contentID).set(
      {
        assignedTo: userID,
        dueDate: await assignDueDate(),
      },
      { merge: true }
    );
    await db.collection("users").doc(userID).set(
      {
        assigned: false,
      },
      { merge: true }
    );
    const userRecord = await auth.getUser(userID);
    const userName = userRecord.displayName || userRecord.uid;
    res.status(200).json({
      status: "Success",
      message: `Content successfully re-assigned to ${userName}`,
    });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ status: "User not found" });
    }
    if (error.message === "Content not found") {
      return res.status(404).json({ status: "Content not found" });
    }
    console.log(error);
    res.status(500).json({ status: "Internal Server Error", error: error.message });
  }
}

async function updateStatus(req, res) {
  try {
    const { userID, contentID, status } = req.body;
    if (!status || !userID || !contentID) {
      throw new Error("Missing required fields: user ID, content ID, or status");
    }
    if (
      status !== "done" &&
      status !== "on-progress" &&
      status !== "assigned" &&
      status !== "unassigned"
    ) {
      throw new Error("Invalid status");
    }
    await getUserDoc(userID);
    await checkUserAuthorization(userID, contentID);
    await db.collection("contents").doc(contentID).set(
      {
        status: status,
      },
      { merge: true }
    );
    res.status(200).json({
      status: "Success",
      message: `Content successfully updated to ${status}`,
    });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ status: "User not found" });
    }
    if (error.message === "Content not found") {
      return res.status(404).json({ status: "Content not found" });
    }
    if (error.message === "User not authorized to update this content") {
      return res.status(404).json({ status: "User not authorized to update this content" });
    }
    res.status(500).json({ status: "Internal Server Error", error: error.message });
  }
}

async function deleteContent(req, res) {
  try {
    const contentID = req.params.contentID;
    if (!contentID) {
      throw new Error("Missing required fields: content ID");
    }
    const content = await getContentDoc(contentID);
    if (content.assignedTo) {
      await db.collection("users").doc(content.assignedTo).set(
        {
          assigned: false,
        },
        { merge: true }
      );
    }
    await db.collection("contents").doc(contentID).delete();
    res.status(200).json({
      status: "Success",
      message: `Content ID ${contentID} deleted successfully`,
    });
  } catch (error) {
    if (error.message === "Content not found") {
      return res.status(404).json({ status: "Content not found" });
    }
    res.status(500).json({ status: "Internal Server Error", error: error.message });
  }
}

async function getContentByID(req, res) {
  try {
    const contentID = req.params.contentID;
    const userID = req.user.uid;
    if (!contentID) {
      throw new Error("Missing required fields: content ID");
    }
    const content = await getContentDoc(contentID);
    const user = await getUserDoc(req.user.uid);
    if (user.roles === "admin" || userID == content.assignedTo) {
      return res.status(200).json({ status: "Success", content: content });
    }
    res.status(404).json({ status: "User not authorized to see this content" });
  } catch (error) {
    if (error.message === "Content not found") {
      return res.status(404).json({ status: "Content not found" });
    }
    res.status(500).json({ status: "Internal Server Error", error: error.message });
  }
}

async function getContentsByUserAndStatus(req, res) {
  try {
    const userID = req.params.userID;
    const status = req.params.status;
    let data = [];
    if (!userID || !status) {
      throw new Error("Missing required fields: User ID, status");
    }
    if (
      status !== "done" &&
      status !== "on-progress" &&
      status !== "assigned" &&
      status !== "unassigned"
    ) {
      return res.status(400).json({ status: "Invalid status parameter" });
    }
    await getUserDoc(userID);
    const user = await getUserDoc(req.user.uid);
    const userRoles = user.roles;
    if (userRoles === "admin") {
      const response = await db.collection("contents").get();
      response.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
    } else {
      const response = await db
        .collection("contents")
        .where("assignedTo", "==", req.user.uid)
        .get();
      response.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
    }
    if (data.length === 0) {
      return res.status(404).json({ status: "No Contents" });
    }
    res.status(200).json({ status: "Success", contents: data });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ status: "User not found" });
    }
    res.status(500).json({ status: "Internal Server Error", error: error.message });
  }
}

module.exports = {
  getAllContents,
  getContentByID,
  getUserAssignedContents,
  getUserContentsByStatus,
  getContentsByUserAndStatus,
  addContent,
  assignContent,
  reAssignContent,
  updateStatus,
  deleteContent,
};
