const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/auth.schema');
const { roleValidation, loginValidation } = require('../utils/config/validators/user.validation');
const { sendEmail } = require('../utils/email/email');
const __res_ = require("../utils/helpers/send.response");
const userSessionSchema = require('../models/user.session.schema');


module.exports = {
    CreateRole: async (req, res) => {
        try {
            const { username, email, password, role } = req.body;
            const { error } = roleValidation(req.body);
            if (error) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 400,
                    message: 'Validation Failed',
                    errorDetails: error.details.map(err => err.message),
                });
            }
            // Check if all required fields are present
            if (!role) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 400,
                    message: "Role is required",
                });
            }
            const existingUser = await userModel.findOne({ email });
            if (existingUser) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 400,
                    message: `Email Already Registerd`
                });
            }

            const user = new userModel({ username, email, password, role });
            await user.save();

            const confirmationLink = `http://example.com/confirm/${user._id}`;
            await sendEmail(
                email,
                'Registration Successful',
                `<p>Thank you for registering. Your account has been successfully created.</p>`
            );

            // Prepare success message based on the role
            let successMessage = "User Registered Successfully";
            const normalizedRole = role.trim().toLowerCase();
            if (normalizedRole === "admin") {
                successMessage = "Admin Registered Successfully";
            } else if (normalizedRole === "manager") {
                successMessage = "Manager Registered Successfully";
            }
            return __res_.out(req, res, {
                status: true,
                statusCode: 200,
                message: successMessage
            });
        } catch (err) {
            console.error(err);
            return __res_.out(req, res, {
                status: false,
                statusCode: 500,
                message: "Internal Server Error"
            });
        }
    },
    Login: async (req, res) => {
        try {
            const { error } = loginValidation(req.body);
            if (error) {
                const errorMessages = error.details.map((detail) => detail.message);
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 400,
                    message: 'Validation Failed',
                    errors: errorMessages,
                });
            }

            const { email, password } = req.body;
            const user = await userModel.findOne({ email });
            if (!user) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 401,
                    message: 'Invalid email or password',
                });
            }
            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 400,
                    message: 'Invalid email or password',
                });
            }

            const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRE,
            });
            const userSession = new userSessionSchema({
                userId: user._id,
                authToken: token,
                createdAt: new Date(),
            });
            await userSession.save();

            return __res_.out(req, res, {
                status: true,
                statusCode: 200,
                message: 'Login Successful',
                data: { token },
            });
        } catch (error) {
            console.log("ERROR=====>", error)
            return __res_.out(req, res, {
                status: false,
                statusCode: 500,
                message: `Internal Server Error`
            })
        }
    },
    getUserProfile: async (req, res) => {
        try {

            const user = await userModel.findById(req.user._id).select('-password');;

            if (!user) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 404,
                    message: 'User not found',
                });
            }

            return __res_.out(req, res, {
                status: true,
                statusCode: 200,
                data: {
                    username: user.username,
                    email: user.email,
                    roles: user.role,
                },
            });
        } catch (err) {
            console.error(err);
            return __res_.out(req, res, {
                status: false,
                statusCode: 500,
                message: 'Internal Server Error',
            });
        }
    },
    getAllUserByAdmin: async (req, res) => {
        try {
            let match = {}
            console.log("req.User========>", req.user);

            if (req.user.role === "admin") {

            }
            else if (req.user.role === "manager") {
                match.role = "user"
            }
            else {
                match._id = req.user._id
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const totalUsers = await userModel.countDocuments(match);

            const user = await userModel.find(match).skip(skip).limit(limit);
            return __res_.out(req, res, {
                status: true,
                statusCode: 200,
                message: `Users Retrieved Successfully`,
                data: {

                    totalUsers, // Total number of users
                    totalPages: Math.ceil(totalUsers / limit), // Total pages
                    currentPage: page, // Current page
                    pageSize: user.length,
                    // user.length > 0 ? user : [],
                    user
                }
            })
        } catch (error) {
            console.log("Error========>", error)
            return __res_.out(req, res, {
                status: false,
                statusCode: 500,
                message: `Internal Server Error`
            })
        }
    },
    Logout: async (req, res) => {
        try {
            const token = req.header("Authorization")?.replace("Bearer ", "");

            if (!token) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 400,
                    message: "Authorization token is required",
                });
            }

            if (!req.user || !req.user._id) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 401,
                    message: "User is not authenticated",
                });
            }

            const result = await userSessionSchema.deleteOne({
                userId: req.user._id,
                authToken: token,
            });

            if (!result.deletedCount) {
                return __res_.out(req, res, {
                    status: false,
                    statusCode: 404,
                    message: "Session not found or already expired",
                });
            }

            return __res_.out(req, res, {
                status: true,
                statusCode: 200,
                message: "Session Expired Successfully"
            })
        } catch (error) {
            console.error("Logout Error:", error);
            return __res_.out(req, res, {
                status: false,
                statusCode: 500,
                message: "Internal Server Error",
            });
        }
    }

}

