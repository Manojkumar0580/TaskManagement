const express = require('express');
const roleController = require('../controllers/auth.controller');
const router = express.Router();
const loginRateLimiter = require('../utils/helpers/ratelimit');
const authenticateRole = require('../middlewares/authenticate.user');

/**
 * @swagger
 * /v1/auth/role/register:
 *   post:
 *     summary: Register a new role
 *     tags:
 *       - Auth
 *     description: Endpoint to register a new role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: "JohnDoe"
 *                 description: "Username for the new user"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *                 description: "Email for the new user"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securepassword"
 *                 description: "Password for the new user"
 *               role:
 *                 type: string
 *                 example: "admin"
 *                 description: "Role of the new user (admin/manager/user)"
 *     responses:
 *       200:
 *         description: "User Registered Successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Admin Registered Successfully"
 *       400:
 *         description: "Validation Error"
 */

router.post('/register', roleController.CreateRole);

/**
 * @swagger
 * /v1/auth/role/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "JohnDoe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securepassword123"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR..."
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 */

router.post('/login', loginRateLimiter, roleController.Login);

/**
 * @swagger
 * /v1/auth/role/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticateRole, roleController.getUserProfile);

/**
 * @swagger
 * /v1/auth/role/logout:
 *   delete:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized
 */
router.delete('/logout', authenticateRole, roleController.Logout);

/**
 * @swagger
 * /v1/auth/role/users:
 *   get:
 *     summary: Get all users by admin
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *       403:
 *         description: Forbidden
 *       401:
 *         description: Unauthorized
 */
router.get('/users', authenticateRole, roleController.getAllUserByAdmin);

module.exports = router;
