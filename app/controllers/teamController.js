const teamModel = require("../models/teamSchema");
const __res_ = require("../utils/helpers/send.response");
const teamValidationSchema = require('../utils/config/validators/team.validation');
const userModel = require("../models/auth.schema");
const taskModel = require("../models/task.schema")


module.exports = {


    createTeam: async (req, res) => {
        try {
            const { error } = teamValidationSchema.create.validate(req.body); // Ensure you're validating against `create` schema
            if (error) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 400,
                    message: error.details[0].message,
                });
            }

            const memberIds = req.body.teamMembers;

            // Validate all team members exist
            const members = await userModel.find({ _id: { $in: memberIds } });
            if (members.length !== memberIds.length) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 404,
                    message: `One or more members not found`,
                    data: null,
                });
            }

            // Create the team
            const team = new teamModel({ ...req.body, createdBy: req.user._id });
            console.log("TEAM=========>", team)
            await team.save();

            // Populate `teamMembers` with user details
            const populatedTeam = await teamModel
                .findById(team._id)
                .populate("teamMembers", "name email") // Populate specific fields of the user schema
                .populate("createdBy", "name email");

            return __res_.out(req, res, {
                status: true,
                statusCode: 201,
                message: `Team created successfully`,
                data: populatedTeam,
            });
        } catch (error) {
            console.error("Error=========>", error); // Log the error for debugging purposes
            return __res_.out(req, res, {
                status: false,
                statusCode: 500,
                message: `Internal Server Error`,
            });
        }
    },

     getTeamMember :async (req) => {
        try {
            const { role, _id } = req.user;
    
            if (role === "user") {
                // User can only see their own tasks
                const userTasks = await taskModel.find({ assignedTo: _id });
                return userTasks;
            }
    
            if (role === "manager") {
                // Manager can see their own tasks and all team members' tasks
                const team = await teamModel
                    .findOne({ teamMembers: { $in: [_id] } })
                    .populate("teamMembers");
    
                if (!team) return []; // If no team is found, return empty
    
                const teamMemberIds = team.teamMembers.map((member) => member._id);
    
                const tasks = await taskModel.find({
                    assignedTo: { $in: [...teamMemberIds, _id] },
                });
                return tasks;
            }
    
            if (role === "admin") {
                // Admin can see all team members and managers' tasks assigned to them
                const teams = await teamModel.find({}).populate("teamMembers");
    
                const managerIds = [];
                teams.forEach((team) => {
                    team.teamMembers.forEach((member) => {
                        if (member.role === "manager") managerIds.push(member._id);
                    });
                });
    
                if (managerIds.length === 0) return []; // If no managers found, return empty
    
                const tasks = await taskModel.find({
                    assignedTo: { $in: managerIds },
                });
    
                return tasks;
            }
    
            // Default case for unexpected roles
            return [];
        } catch (err) {
            console.error("Error in getTeamMember:", err);
            return [];
        }
    },
    
}