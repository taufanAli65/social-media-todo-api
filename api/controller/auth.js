const { db, auth } = require("../firebase-config");
const axios = require("axios")
require("dotenv").config();

async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    let userID = "";
    await auth
      .createUser({
        email: email,
        password: password,
        displayName: name,
      })
      .then(async (userRecord) => {
        userID = userRecord.uid;
        await db
          .collection("users")
          .doc(userID)
          .set({ roles: "employee", employment_status: "active" });
        res.status(200).json({
          status: "Success",
          message: `Successfully created new User : ${userID}`,
        });
      });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Internal Server Error", error: error.message });
  }
}

async function login(req, res) {
  try {
    const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
    const { email, password } = req.body;
    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
      email,
      password,
      returnSecureToken: true,
    });
    res.status(200).json({status: "Success", idToken: response.data.idToken});
  } catch (error) {
    res
      .status(500)
      .json({ status: "Internal Server Error", error: error.message });
  }
} // There is no build in function to server side login from firebase-admin, so im redirecting /login into https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}

async function deleteUser(req, res) {
  try {
    const { userID } = req.params;
    if (!userID) {
      throw new Error("There is not user id provided!");
    }
    await auth.deleteUser(userID);
    await db.collection("users").doc(userID).delete();
    res.status(200).json(`User ID : ${userID} is deleted successfully`);
  } catch (error) {
    res.status(500).json({ status: "failed", error: error.message });
  }
} // only for testing purposes

module.exports = { register, deleteUser, login };
