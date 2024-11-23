const express = require('express');
const taskController = require('../controllers/task.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/check.role');
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management APIs
 */

/**
 * @swagger
 * /api/task:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - dueDate
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Task"
 *               description:
 *                 type: string
 *                 example: "Complete the assignment"
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-01T10:00:00Z"
 *               priority:
 *                 type: string
 *                 enum: ['low', 'medium', 'high']
 *                 default: 'medium'
 *               status:
 *                 type: string
 *                 enum: ['pending', 'in-progress', 'completed']
 *                 default: 'pending'
 *               assignedTo:
 *                 type: string
 *                 example: "63f2a1c3b4f2a5d9f4e1a2c8"  # ObjectId of the user to whom the task is assigned
 *               createdBy:
 *                 type: string
 *                 example: "63f2a1c3b4f2a5d9f4e1a2c7"  # ObjectId of the user who created the task
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateUser, checkRole(['admin', 'manager']), taskController.createTask);

/**
 * @swagger
 * /api/task/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   dueDate:
 *                     type: string
 *                     format: date-time
 *                   priority:
 *                     type: string
 *                   status:
 *                     type: string
 *                   assignedTo:
 *                     type: string
 *                   createdBy:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/tasks', authenticateUser, taskController.getAllTasks);

/**
 * @swagger
 * /api/task/tasks/{id}:
 *   put:
 *     summary: Update a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Task"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-02T10:00:00Z"
 *               priority:
 *                 type: string
 *                 enum: ['low', 'medium', 'high']
 *               status:
 *                 type: string
 *                 enum: ['pending', 'in-progress', 'completed']
 *               assignedTo:
 *                 type: string
 *                 example: "63f2a1c3b4f2a5d9f4e1a2c8"  # ObjectId of the user to whom the task is assigned
 *               createdBy:
 *                 type: string
 *                 example: "63f2a1c3b4f2a5d9f4e1a2c7"  # ObjectId of the user who created the task
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put('/tasks/:id', authenticateUser, taskController.updateTask);

/**
 * @swagger
 * /api/task/tasks/{id}:
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/tasks/:id', authenticateUser, taskController.deleteTask);

/**
 * @swagger
 * /api/task/assign:
 *   post:
 *     summary: Assign a task to a user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskId:
 *                 type: string
 *                 example: "63f2a1c3b4f2a5d9f4e1a2c8"
 *               userId:
 *                 type: string
 *                 example: "63f2a1c3b4f2a5d9f4e1a2c7"
 *     responses:
 *       200:
 *         description: Task assigned successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/assign', authenticateUser, checkRole(['manager']), taskController.assignTask);

/**
 * @swagger
 * /api/task:
 *   get:
 *     summary: Get tasks assigned to the logged-in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of assigned tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   assignedBy:
 *                     type: string
 *                   dueDate:
 *                     type: string
 *                     format: date-time
 *                   priority:
 *                     type: string
 *                   status:
 *                     type: string
 *                   assignedTo:
 *                     type: string
 *                   createdBy:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateUser, taskController.getAssignedTasks);

module.exports = router;
