const taskModel = require("../models/task.schema");
const userModel = require("../models/auth.schema")
const mongoose = require("mongoose")
const taskValidationSchema = require('../utils/config/validators/task.validator');
const __res_ = require("../utils/helpers/send.response")

module.exports = {
    createTask: async (req, res) => {
        try {
            const { error } = taskValidationSchema.validate(req.body);
            if (error) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 400,
                    message: error.details[0].message
                });
            }

            const task = new taskModel({ ...req.body, createdBy: req.user._id });
            await task.save();

            return __res_.out(req, res, {
                status: true,
                statusCode: 200,
                message: `Task created successfully`,
                data: task
            });
        } catch (error) {
            console.error(error); // Log the error for debugging purposes
            return __res_.out(req, res, {
                status: false,
                statusCode: 500,
                message: `Internal Server Error`
            });
        }
    },
    getAllTasks: async (req, res) => {
        try {

            const tasks = await taskModel.find({ createdBy: req.user._id });

            return __res_.out(req, res, {
                status: true,
                statusCode: 200,
                message: 'Tasks retrieved successfully',
                data: tasks
            });
        } catch (error) {
            console.error(error); // Log the error for debugging purposes
            return __res_.out(req, res, {
                status: false,
                statusCode: 500,
                message: 'Internal Server Error'
            });
        }
    },
    updateTask: async (req, res) => {
        try {
            const taskId = req.params.id;

            // Find task by ID
            const task = await taskModel.findById(taskId);

            if (!task) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 404,
                    message: 'Task not found'
                });
            }

            // Update task fields
            const updatedTask = await taskModel.findByIdAndUpdate(taskId, req.body, { new: true });

            return __res_.out(req, res, {
                status: true,
                statusCode: 200,
                message: 'Task updated successfully',
                data: updatedTask
            });
        } catch (error) {
            console.error(error); // Log the error for debugging purposes
            return __res_.out(req, res, {
                status: false,
                statusCode: 500,
                message: 'Internal Server Error'
            });
        }
    },
    deleteTask: async (req, res) => {
        try {
            const taskId = req.params.id;

            // Find task by ID
            const task = await taskModel.findById(taskId);

            if (!task) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 404,
                    message: 'Task not found'
                });
            }

            // Delete the task
            await taskModel.findByIdAndDelete(taskId);

            return __res_.out(req, res, {
                status: true,
                statusCode: 200,
                message: 'Task deleted successfully'
            });
        } catch (error) {
            console.error(error); // Log the error for debugging purposes
            return __res_.out(req, res, {
                status: false,
                statusCode: 500,
                message: 'Internal Server Error'
            });
        }
    },



    getAssignedTasks: async (req, res) => {
        try {
            const userId = req.user._id;
            const userRole = req.user.role;

            if (userRole === 'admin') {
                const tasks = await taskModel.find().populate('assignedTo createdBy');
                return __res_.out(req, res, {
                    status: true,
                    statusCode: 200,
                    message: 'Tasks fetched successfully',
                    data: { tasks }
                });
            }

            if (userRole === 'manager') {
                const manager = await userModel.findById(userId);
                const managedUsers = manager.team;

                const tasks = await taskModel.find({
                    $or: [
                        { assignedTo: userId },
                        { assignedTo: { $in: managedUsers } }
                    ]
                }).populate('assignedTo createdBy');

                return __res_.out(req, res, {
                    status: true,
                    statusCode: 200,
                    message: 'Tasks fetched successfully',
                    data: { tasks }
                });
            }

            if (userRole === 'user') {
                const tasks = await taskModel.find({ assignedTo: userId }).populate('assignedTo createdBy');
                return __res_.out(req, res, {
                    status: true,
                    statusCode: 200,
                    message: 'Tasks fetched successfully',
                    data: { tasks }
                });
            }

            return __res_.out(req, res, {
                status: false,
                statusCode: 403,
                message: 'Forbidden'
            });

        } catch (error) {
            return __res_.out(req, res, {
                status: false,
                statusCode: 500,
                message: error.message
            });
        }
    },
    assignTask: async (req, res) => {
        try {
            const { taskId, userId } = req.body;
            if (!mongoose.isValidObjectId(taskId)) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 400,
                    message: 'Invalid Task ID format',
                });
            }

            if (!mongoose.isValidObjectId(userId)) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 400,
                    message: 'Invalid User ID format',
                });
            }
            const task = await taskModel.findById(taskId);
            if (!task) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 404,
                    message: 'Task not found',
                });
            }
            // Ensure the user is part of the same team or role as the manager (optional)
            const managerId = req.user._id;
            const manager = await userModel.findById(managerId);
            if (manager.role !== 'manager') {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 403,
                    message: 'Only managers can assign tasks',
                });
            }
            // Fetch the assigned user
            const user = await userModel.findById(userId);
            if (!user) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 404,
                    message: 'User not found',
                });
            }

            // Check if the user's role is "user"
            if (user.role !== 'user') {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 403,
                    message: 'Only users can be assigned tasks',
                });
            }


            // Assign the task to the user
            task.assignedTo = userId;
            await task.save();

            return __res_.out(req, res, {
                status: true,
                statusCode: 200,
                message: 'Task assigned successfully',
                data: task,
            });
        } catch (error) {
            console.error(error);
            return __res_.out(req, res, {
                status: false,
                statusCode: 500,
                message: 'Internal Server Error',
            });
        }
    },
    updateTaskAssignment: async (req, res) => {
        try {
            const { taskId, newUserId } = req.body;

            // Find task by ID
            const task = await taskModel.findById(taskId);
            if (!task) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 404,
                    message: 'Task not found',
                });
            }
            // Ensure the user is a manager (optional)
            const managerId = req.user._id;
            const manager = await userModel.findById(managerId);
            if (manager.role !== 'manager') {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 403,
                    message: 'Only managers can update task assignments',
                });
            }
            // If newUserId is provided, reassign the task
            if (newUserId) {
                // Check if the new user exists
                const newUser = await userModel.findById(newUserId);
                if (!newUser) {
                    return __res_.out(req, res, {
                        status: false,
                        statusCode: 404,
                        message: 'New user not found',
                    });
                }
                task.assignedTo = newUserId;
            } else {
                // If newUserId is not provided, remove the assignment
                task.assignedTo = null;
            }
            await task.save();

            return __res_.out(req, res, {
                status: true,
                statusCode: 200,
                message: 'Task assignment updated successfully',
                data: task,
            });

        } catch (error) {
            console.error(error);
            return __res_.out(req, res, {
                status: false,
                statusCode: 500,
                message: 'Internal Server Error',
            });
        }
    },

};