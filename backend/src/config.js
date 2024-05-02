const mongoose = require("mongoose");

// Correct MongoDB connection string
mongoose.connect('mongodb://localhost:27017/login-tut', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Database connected successfully");
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
    });

// Correct schema definition
const loginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// Export the model
const User = mongoose.model("User", loginSchema);

module.exports = User;

