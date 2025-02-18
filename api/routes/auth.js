const express = require("express");
const router = express();
const { register, deleteUser } = require("../controller/auth");

router.post("/register", async (req, res) => register(req, res));
router.post("/delete/:userID", async (req, res) => deleteUser(req, res));

module.exports = router;
