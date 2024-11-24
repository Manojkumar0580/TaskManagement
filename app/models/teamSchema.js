const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        teamName: {
            type: String,
            index: true,
            unique: true,
        },
        teamMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Team', teamSchema);