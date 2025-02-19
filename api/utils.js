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

module.exports = { assignDueDate };
