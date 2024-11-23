const mongoose = require("mongoose");

const UserSessionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},

		authToken: {
			type: String,
			trim: true,
			required: true,
		},
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model("user_sessions", UserSessionSchema);
