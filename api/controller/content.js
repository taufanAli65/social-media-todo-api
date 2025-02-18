const { db, auth } = require("../firebase-config");
const { assignDueDate } = require("../utils");

async function getAllContents(req, res) {
  try {
    let data = [];
    const response = await db.collection("contents").get();
    response.forEach((doc) => {
      data.push(doc.id, "=>", doc.data());
    });
    if (!data) {
      res.status(204).json({ status: "No Contents" });
    }
    res.status(200).json({ status: "Success", contents: data });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Internal Server Error", error: error.message });
  }
} // get all content

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
      .add({ title, brand, platform, payment, status, dueDate }).then((content) => {
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
    const { userID, contentID } = req.params;
    const userDoc = await db.collection("users").doc(userID).get();
    if (!userDoc.exists) {
      return res.status(404).json({ status: "User not found" });
    }
    const contentDoc = await db.collection("contents").doc(contentID).get();
    if (!contentDoc.exists) {
      return res.status(404).json({ status: "Content not found" });
    }
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
}

module.exports = { getAllContents, addContent, assignContent };
