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
        await db.collection("users").doc(userID).set({ roles: "employee" });
        res
          .status(200)
          .json({
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

module.exports = { register };
