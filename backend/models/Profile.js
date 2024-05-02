const mongoose = require("mongoose");

// Define the schema for Profile
const profileSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    photo: { type: String, default: "" }
});

// Custom error handling middleware for duplicate key errors
profileSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        const key = Object.keys(error.keyPattern)[0];
        const value = error.keyValue[key];
        
        if (value === null || value === undefined) {
            const errorMessage = `${key} cannot be null or undefined. Please provide a valid ${key}.`;
            return next(new Error(errorMessage));
        }

        const errorMessage = `${key} '${value}' already exists. Please choose a different ${key}.`;
        return next(new Error(errorMessage));
    }

    next(error); // Continue to the next middleware
});

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
