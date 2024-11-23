const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone:{
        type:Number,
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    role: { 
        type: String, 
        enum: ['admin', 'manager', 'user'], 
        default: 'user' 
    }, 
},
    {
        timestamps: true,
    });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', userSchema);