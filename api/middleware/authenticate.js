const { db, auth } = require("../firebase-config");

async function authenticate(req, res, next) {
  try {
    const idToken =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!idToken) {
      res.status(401).json({ status: "invalid", message: "No token provided" });
    }
    req.user = await auth.verifyIdToken(idToken); //set user information in req.user
    console.log(req.user) //for debugging
    let roles = await db.collection("users").doc(req.user.uid);
    req.user.roles = roles; //set user roles in req.user
    next();
  } catch (error) {
    res.status(500).json({ status: "Failed", error: error.message });
  }
}

module.exports = authenticate;
