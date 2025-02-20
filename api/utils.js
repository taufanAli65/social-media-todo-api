const { db } = require("./firebase-config");

async function getUserDoc(userID) {
  const userDoc = await db.collection("users").doc(userID).get();
  if (!userDoc.exists) {
    throw new Error("User not found");
  }
  return userDoc.data();
}

async function getContentDoc(contentID) {
  const contentDoc = await db.collection("contents").doc(contentID).get();
  if (!contentDoc.exists) {
    throw new Error("Content not found");
  }
  return contentDoc.data();
}

async function assignDueDate() {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7); // due date = 1 week after today
  return dueDate;
}

async function getUserRole(userID) {
  const user = await getUserDoc(userID);
  return user.roles;
}

async function checkUserAuthorization(userID, contentID) {
  const content = await getContentDoc(contentID);
  if (userID !== content.assignedTo) {
    throw new Error("User not authorized to update this content");
  }
}

module.exports = {
  getUserDoc,
  getContentDoc,
  assignDueDate,
  getUserRole,
  checkUserAuthorization,
};
