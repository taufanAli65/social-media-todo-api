const { db } = require("../api/firebase-config");

function assignDueDate() {
  let today = new Date();
  today.setDate(today.getDate() + 7); // Add 7 days
  let dd = String(today.getDate()).padStart(2, "0");
  let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  let yyyy = today.getFullYear();
  today = dd + "/" + mm + "/" + yyyy;
  return today;
} // due date for each content is 7 days from today

async function check_docs_exist(req, res, collectionName, docID) {
  const response = await db.collection(collectionName).doc(docID).get();
  if (!response.exists && collectionName === "users") {
    return res.status(404).json({ status: "User not found" });
  } else if (!response.exists && collectionName === "contents") {
    return res.status(404).json({ status: "Content not found" });
  }
  if (response.data() && response.data().assigned) {
    return res
      .status(400)
      .json({ status: "User or Content already assigned" });
  } // checking if there is response data and contain assigned fields
} // checking if there is docs with following collection name and doc ID

module.exports = { assignDueDate, check_docs_exist };
