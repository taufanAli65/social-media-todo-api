const express = require("express");
const router = express();
const { register, deleteUser, login } = require("../controller/auth");
const verifyRoles = require("../middleware/verifyRole");
const authenticate = require("../middleware/authenticate");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully created new User
 *       500:
 *         description: Internal Server Error
 */
router.post("/register", async (req, res) => register(req, res));

/**
 * @swagger
 * /auth/delete/{userID}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Auth]
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
 *         description: User deleted successfully
 *       500:
 *         description: Internal Server Error
 */
router.delete("/delete/:userID", authenticate, verifyRoles, async (req, res) => deleteUser(req, res)); // for testing purposes only

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login an admin/user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 */
router.post("/login", async (req, res) => login(req, res));

module.exports = router;
