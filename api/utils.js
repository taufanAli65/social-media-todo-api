function assignDueDate() {
  let today = new Date();
  today.setDate(today.getDate() + 7); // Add 7 days
  let dd = String(today.getDate()).padStart(2, "0");
  let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  let yyyy = today.getFullYear();
  today = dd + "/" + mm + "/" + yyyy;
  return today;
} // due date for each content is 7 days from today

async function check_user(userID) {
  try {
    const { auth } = require("../api/firebase-config");
    const userRecord = await auth.getUser(userID);
    return true; // Return true if user exists
  } catch (error) {
    return false; // Return false if user is not found
  }
} //checking if user with following ID exist

module.exports = { assignDueDate, check_user };
