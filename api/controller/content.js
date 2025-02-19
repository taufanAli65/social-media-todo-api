const { db, auth } = require("../firebase-config");
const { assignDueDate, check_docs_exist } = require("../utils");

async function getAllContents(req, res) {
  try {
    let data = [];
    const user = (await db.collection("users").doc(req.user.uid).get()).data();
    const userRoles = user.roles;
    if (userRoles === "admin") {
      const response = await db.collection("contents").get();
      response.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      }); // get all data if the user have admin roles
    } else {
      const response = await db
        .collection("contents")
        .where("assignedTo", "==", req.user.uid)
        .get();
      response.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      }); // get user data if the user didn't have admin roles
    }
    if (data.length === 0) {
      return res.status(404).json({ status: "No Contents" });
    }
    res.status(200).json({ status: "Success", contents: data });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Internal Server Error", error: error.message });
  }
} // get all content based on user roles

async function getUserAssignedContents(req, res) {
  try {
    const userID = req.params.userID;
    await check_docs_exist(req, res, "users", userID); // check if the user exist
    let data = [];
    const user = (await db.collection("users").doc(req.user.uid).get()).data();
    if (user.roles === "admin" || userID == req.user.id) {
      const response = await db
        .collection("contents")
        .where("assignedTo", "==", userID)
        .get();
      response.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      }); // ensure that the user can only see their content management, except for the admin
    }
    if (data.length === 0) {
      return res.status(404).json({ status: "No Contents" });
    }
    res.status(200).json({ status: "Success", contents: data });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Internal Server Error", error: error.message });
  }
} // get all contents assigned to, on-progress, and completed by the user

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
    console.log(error)
    res
      .status(500)
      .json({ status: "Internal Server Error", error: error.message });
  }
} // get all user managed contents, sort by assigned, unassigned, on-progress, and done

async function addContent(req, res) {
  try {
    let contentID; // initialize contentID
    const { title, brand, platform, payment } = req.body;
    if (!title || !brand || !platform || !payment) {
      throw new Error(
        "Missing required fields: title, brand, platform, and/or payment"
      );
    }
    const status = "unassigned";
    const dueDate = assignDueDate(); // due date = 1 week after today
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
    res
      .status(500)
      .json({ status: "Internal Server Error", error: error.message });
  }
} // add new content to manage

async function assignContent(req, res) {
  try {
    const { userID, contentID } = req.body;
    await check_docs_exist(req, res, "users", userID); // check if the user exist
    await check_docs_exist(req, res, "contents", contentID); // check if the content exist
    await db.collection("contents").doc(contentID).set(
      {
        status: "assigned",
        assignedTo: userID,
      },
      { merge: true }
    ); // assigned content to user
    await db.collection("users").doc(userID).set(
      {
        assigned: true,
      },
      { merge: true }
    ); // update user to assigned
    const userRecord = await auth.getUser(userID);
    const userName = userRecord.displayName || userRecord.uid;
    res.status(200).json({
      status: "Success",
      message: `Content successfully assigned to ${userName}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Internal Server Error", error: error.message });
  }
} // assign content to user

module.exports = {
  getAllContents,
  getUserAssignedContents,
  getUserContentsByStatus,
  addContent,
  assignContent,
};
