const express = require('express');
const teamController = require('../controllers/teamController');
const { authenticateUser } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/check.role');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: APIs for managing teams
 */

/**
 * @swagger
 * /api/team:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamName
 *               - teamMembers
 *             properties:
 *               teamName:
 *                 type: string
 *                 example: "Development Team"
 *               teamMembers:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ObjectId of a user
 *                 example: ["63f2a1c3b4f2a5d9f4e1a2c8", "63f2a1c3b4f2a5d9f4e1a2c9"]
 *     responses:
 *       201:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team created successfully"
 *                 team:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     teamName:
 *                       type: string
 *                     teamMembers:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/team/get:
 *   get:
 *     summary: Get all team members
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of team members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "63f2a1c3b4f2a5d9f4e1a2c8"
 *                   teamName:
 *                     type: string
 *                     example: "Development Team"
 *                   teamMembers:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "63f2a1c3b4f2a5d9f4e1a2c8"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Teams not found
 */

router.post('/', authenticateUser, checkRole(['admin', 'manager']), teamController.createTeam);
router.get('/get', authenticateUser, teamController.getTeamMember);

module.exports = router;
