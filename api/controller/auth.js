const { db, auth } = require("../firebase-config");

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

async function deleteUser(req, res) {
  try {
    const { userID } = req.params;
    if (!userID) {
      throw new Error("There is not user id provided!");
    }
    await auth.deleteUser(userID).then((userID) => {
      res.status(200).json(`User ID : ${userID} is deleted successfully`);
    });
  } catch (error) {
    res.status(500).json({ status: "failed", error: error.message });
  }
} // only for testing purposes

module.exports = { register, deleteUser };
