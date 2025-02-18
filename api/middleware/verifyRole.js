const { db } = require("../firebase-config");

async function verifyRoles(req, res, next) {
  try {
    const user = (await db.collection("users").doc(req.user.uid).get()).data();
    const userRoles = user.roles;
    if (!userRoles) {
      throw new Error("No roles found for this user!");
    } else if (userRoles !== "admin") {
      throw new Error("Access denied. Unauthorized role.");
    }
    next();
  } catch (error) {
    res
      .status(403)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

module.exports = verifyRoles;
