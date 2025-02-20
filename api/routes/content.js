const express = require("express");
const authenticate = require("../middleware/authenticate");
const verifyRoles = require("../middleware/verifyRole");
const {
  getAllContents,
  getContentByID,
  getUserAssignedContents,
  getUserContentsByStatus,
  addContent,
  assignContent,
  reAssignContent,
  updateStatus,
  deleteContent,
} = require("../controller/content");
const router = express();

/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Content management endpoints
 */

/**
 * @swagger
 * /content:
 *   get:
 *     summary: Get all contents
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: No Contents
 *       500:
 *         description: Internal Server Error
 */
router.get("/", authenticate, async (req, res) => {
  getAllContents(req, res);
});

/**
 * @swagger
 * /content/{contentID}:
 *   get:
 *     summary: Get content by ID
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentID
 *         schema:
 *           type: string
 *         required: true
 *         description: The content ID
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Content not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:contentID", authenticate, async (req, res) => {
  getContentByID(req, res);
});

/**
 * @swagger
 * /content/user/{userID}:
 *   get:
 *     summary: Get contents assigned to a user
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/user/:userID", authenticate, async (req, res) => {
  getUserAssignedContents(req, res);
});

/**
 * @swagger
 * /content/all/{status}:
 *   get:
 *     summary: Get contents by status
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         schema:
 *           type: string
 *         required: true
 *         description: The content status
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid status parameter
 *       500:
 *         description: Internal Server Error
 */
router.get("/all/:status", authenticate, verifyRoles, async (req, res) => {
  getUserContentsByStatus(req, res);
});

/**
 * @swagger
 * /content:
 *   post:
 *     summary: Add new content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               brand:
 *                 type: string
 *               platform:
 *                 type: string
 *               payment:
 *                 type: number
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 */
router.post("/", authenticate, verifyRoles, async (req, res) => {
  addContent(req, res);
});

/**
 * @swagger
 * /content/assign:
 *   post:
 *     summary: Assign content to a user
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *               contentID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: User or Content not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/assign", authenticate, verifyRoles, async (req, res) => {
  assignContent(req, res);
});

/**
 * @swagger
 * /content/reassign:
 *   put:
 *     summary: Reassign content to a different user
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *               contentID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: User or Content not found
 *       500:
 *         description: Internal Server Error
 */
router.put("/reassign", authenticate, verifyRoles, async (req, res) => {
  reAssignContent(req, res);
});

/**
 * @swagger
 * /content:
 *   put:
 *     summary: Update content status
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *               contentID:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: User or Content not found
 *       500:
 *         description: Internal Server Error
 */
router.put("/", authenticate, async (req, res) => {
  updateStatus(req, res);
});

/**
 * @swagger
 * /content/{contentID}:
 *   delete:
 *     summary: Delete a content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentID
 *         schema:
 *           type: string
 *         required: true
 *         description: The content ID
 *     responses:
 *       200:
 *         description: Content deleted successfully
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:contentID", authenticate, verifyRoles, async (req, res) => {
  deleteContent(req, res);
});

module.exports = router;
