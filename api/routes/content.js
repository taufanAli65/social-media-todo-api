const express = require("express");
const authenticate = require("../middleware/authenticate");
const verifyRoles = require("../middleware/verifyRole");
const {
  getAllContents,
  getUserAssignedContents,
  getUserContentsByStatus,
  addContent,
  assignContent,
  reAssignContent,
  updateStatus,
} = require("../controller/content");
const router = express();

router.get("/", authenticate, async (req, res) => {
  getAllContents(req, res);
});
router.get("/user/:userID", authenticate, async (req, res) => {
  getUserAssignedContents(req, res);
});
router.get("/all/:status", authenticate, verifyRoles, async (req, res) => {
  getUserContentsByStatus(req, res);
});
router.post("/", authenticate, verifyRoles, async (req, res) => {
  addContent(req, res);
});
router.post("/assign", authenticate, verifyRoles, async (req, res) => {
  assignContent(req, res);
});
router.put("/reassign", authenticate, verifyRoles, async (req, res) => {
  reAssignContent(req, res);
});
router.put("/", authenticate, async (req, res) => {
  updateStatus(req, res);
});

module.exports = router;
