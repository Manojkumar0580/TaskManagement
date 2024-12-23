const mongoose = require('mongoose');
const {TaskStatus} = require("../utils/config/menuItems")

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    priority: {
        type: String, enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String, 
        enum: TaskStatus,
        default: 'pending'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
