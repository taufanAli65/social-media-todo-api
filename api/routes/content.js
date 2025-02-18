const express = require("express");
const authenticate = require("../middleware/authenticate");
const verifyRoles = require("../middleware/verifyRole");
const { getAllContents, addContent } = require("../controller/content");
const router = express();

router.get("/", authenticate, verifyRoles, async (req, res) => {
  getAllContents(req, res);
});
router.post("/", authenticate, verifyRoles, async (req, res) => {
  addContent(req, res);
});

module.exports = router;