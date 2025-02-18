const express = require("express");
const router = express();
const { register, deleteUser, login } = require("../controller/auth");
const verifyRoles = require("../middleware/verifyRole");
const authenticate = require("../middleware/authenticate");

router.post("/register", async (req, res) => register(req, res));
router.post("/delete/:userID", authenticate, verifyRoles, async (req, res) => deleteUser(req, res)); // for testing purposes only
router.post("/login", async (req, res) => login(req, res));

module.exports = router;
