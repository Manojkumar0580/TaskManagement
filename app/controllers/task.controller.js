const taskModel = require("../models/task.schema");
const userModel = require("../models/auth.schema")
const mongoose = require("mongoose")
const taskValidationSchema = require('../utils/config/validators/task.validator');
const __res_ = require("../utils/helpers/send.response");
const { TaskStatus } = require("../utils/config/menuItems");
const TeamModel = require("../models/teamSchema")

const getTeamMember = async (req) => {
    try {
        if (req.user.role === "user") {
            return [new mongoose.Schema.ObjectId(req.user._id)];
        }
        const team = await TeamModel.find({


            teamMembers: req.user._id,

        }).populate("teamMembers");
        console.log("TEAM===========>", team);
        if (!team) return [];
    } catch (err) {
        console.log(err);

        return [];
    }
};
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
            getTeamMember(req)
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

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            if (userRole === 'admin') {
                const totalTasks = await taskModel.countDocuments();
                const tasks = await taskModel
                    .find()
                    .skip(skip)
                    .limit(limit)
                    .populate('assignedTo createdBy');

                return __res_.out(req, res, {
                    status: true,
                    statusCode: 200,
                    message: 'Tasks fetched successfully',
                    data: {
                        totalTasks,
                        totalPages: Math.ceil(totalTasks / limit),
                        currentPage: page,
                        pageSize: tasks.length,
                        Tasks: tasks
                    }
                });
            }

            // Exclude tasks created by admins for manager and user
            const query = { 'createdBy.role': { $ne: 'admin' } };

            if (userRole === 'manager') {
                const manager = await userModel.findById(userId).populate('team');
                const managedUsers = manager?.team.map(user => user._id) || [];

                query.$or = [
                    { assignedTo: userId },
                    { assignedTo: { $in: managedUsers } }
                ];
            }

            if (userRole === 'user') {
                // Fetch tasks assigned only to the logged-in user
                const tasks = await taskModel
                    .find({ assignedTo: userId }) // Strictly match assignedTo with the logged-in user's ID
                    .skip(skip)
                    .limit(limit)
                    .populate('assignedTo createdBy'); // Populate user and creator details

                const totalUserTasks = await taskModel.countDocuments({ assignedTo: userId });

                return __res_.out(req, res, {
                    status: true,
                    statusCode: 200,
                    message: 'Tasks fetched successfully',
                    data: {
                        totalTasks: totalUserTasks, // Total tasks assigned to this user
                        totalPages: Math.ceil(totalUserTasks / limit), // Total pages for this user
                        currentPage: page,
                        pageSize: tasks.length,
                        Tasks: tasks
                    }
                });
            }

        } catch (error) {
            console.error("Error fetching tasks:", error);

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

            const requestingId = req.user._id;
            const requestingUser = await userModel.findById(requestingId);

            // Fetch the assigned user
            const user = await userModel.findById(userId);
            if (!user) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 404,
                    message: 'User not found',
                });
            }

            if (requestingUser.role === 'user' || (requestingUser.role === 'manager' && ["manager", "admin"].includes(user.role))) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 403,
                    message: 'You are not able to assgin Tasks',
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

            const task = await taskModel.findById(taskId);
            if (!task) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 404,
                    message: 'Task not found',
                });
            }

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

    updateTaskStatus: async (req, res) => {
        try {
            const taskId = req.params.id;
            const taskStatus = req.body.status;

            console.log("TASK STATUS========>", taskStatus);

            if (!TaskStatus.includes(taskStatus)) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 404,
                    message: 'Invalid Status',
                });
            }
            const task = await taskModel.findById(taskId);
            console.log("TASK=========>", task);

            if (!task) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 404,
                    message: 'Task not found',
                });
            }
            if (task.assignedTo?.toString() !== req.user._id) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 404,
                    message: 'You Are Not Allowed To Update the Task',
                });
            }
            task.status = taskStatus
            await task.save();
            return __res_.out(req, res, {
                status: true,
                statusCode: 200,
                message: 'Task Updated Successfully',
                data: task
            });


        } catch (error) {
            console.log("ERROR===========>", error)
            return __res_.out(req, res, {
                status: false,
                statusCode: 500,
                message: `Internal Server Error`
            })
        }
    }

};