const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            requried: true,
            unique: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            min: [6, 'Must be at least 6']
        },
        fullName: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Others"]
        },
        age: {
            type: Number,
        },
        country: {
            type: String,
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);