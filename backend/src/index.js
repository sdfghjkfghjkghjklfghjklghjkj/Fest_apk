const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const User = require("./config");
const Profile = require("../models/Profile");
const multer = require('multer');

const app = express();

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Destination directory for file uploads
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original filename for the uploaded file
    }
});

const upload = multer({ storage: storage });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("backend/public"));

// Render login page
app.get("/", (req, res) => {
    res.render("login", { error: null });
});

// Render signup page
app.get("/signup", (req, res) => {
    res.render("signup", { error: null });
});

// Handle file upload
app.post('/upload', upload.single('myFile'), (req, res) => {
    // Access uploaded file details via req.file
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send('File uploaded successfully!');
});

app.post("/profile", upload.single('photo'), async (req, res) => {
    // Handle profile creation or update with photo upload
});


// Render profile page
app.get("/profile", async (req, res) => {
    try {
        const username = req.query.username;
        const profile = await Profile.findOne({ username });

        if (!profile) {
            return res.render("profile", { profile: null });
        }

        res.render("profile", { profile });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.render("error", { message: "An error occurred while fetching profile." });
    }
});

// Register new user
app.post("/signup", async (req, res) => {
    const { uname, password } = req.body;

    try {
        const existingUser = await User.findOne({ name: uname });

        if (existingUser) {
            return res.render("signup", {
                error: "User already exists. Please choose a different username.",
                uname: uname,
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ name: uname, password: hashedPassword });
        await newUser.save();

        res.redirect("/"); // Redirect to login page after successful signup
    } catch (error) {
        console.error("Error registering user:", error);
        res.render("error", {
            message: "An error occurred during registration. Please try again later.",
        });
    }
});
// User login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ name: username });

        if (!user) {
            return res.render("login", { error: "User not found." });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (isPasswordMatch) {
            res.render("home");
        } else {
            res.render("login", { error: "Wrong password" });
        }
    } catch (error) {
        console.error("Error logging in:", error);
        res.render("error", { message: "An error occurred during login." });
    }
});
// Route to handle profile data submission
app.post("/profile/data", async (req, res) => {
    const { username, email, phoneNumber } = req.body;

    try {
        if (!username) {
            return res.status(400).json({ error: "Username is required." });
        }

        // Find existing profile or create a new one
        let profile = await Profile.findOne({ username });

        if (!profile) {
            profile = new Profile({ username });
        }

        // Update profile data
        profile.email = email;
        profile.phoneNumber = phoneNumber;

        // Save the profile to the database
        await profile.save();

        res.redirect(`/profile?username=${username}`);
    } catch (error) {
        console.error("Error saving or updating profile data:", error);
        res.status(500).json({ error: "An error occurred while saving or updating the profile data." });
    }
});

// Create or update user profile with photo upload
app.post("/profile", upload.single('photo'), async (req, res) => {
    const { username, email, phoneNumber } = req.body;
    const photo = req.file ? req.file.path : null;

    try {
        if (!username) {
            return res.status(400).json({ error: "Username is required." });
        }

        let profile = await Profile.findOne({ username });

        if (profile) {
            // Update existing profile
            profile.email = email;
            profile.phoneNumber = phoneNumber;
            if (photo) {
                profile.photo = photo;
            }
        } else {
            // Create new profile
            profile = new Profile({ username, email, phoneNumber, photo });
        }

        await profile.save();
        res.redirect(`/profile?username=${username}`);
    } catch (error) {
        console.error("Error saving or updating profile:", error);
        res.status(500).json({ error: "An error occurred while saving or updating the profile." });
    }
});

// Save user profile
app.post("/saveProfile", async (req, res) => {
    const { username, email, phoneNumber, photo } = req.body;

    // Validate that username is provided and not empty
    if (!username || username.trim() === '') {
        return res.status(400).json({ error: "Username is required and cannot be empty." });
    }

    try {
        // Check if a profile with the given username already exists
        const existingProfile = await Profile.findOne({ username });

        if (existingProfile) {
            // Profile already exists for this username
            return res.status(409).json({ error: "Username already exists. Please choose a different username." });
        }

        // Create a new profile instance
        const newProfile = new Profile({
            username,
            email,
            phoneNumber,
            photo: photo || "", // Default photo if not provided
        });

        // Save the new profile to the database
        await newProfile.save();

        res.status(201).json({ message: "Profile saved successfully." });
    } catch (error) {
        console.error("Error saving profile:", error);
        res.status(500).json({ error: "An error occurred while saving the profile." });
    }
});

// Render edit profile page
app.get("/profile/edit", async (req, res) => {
    try {
        const username = req.query.username;
        const profile = await Profile.findOne({ username });

        if (!profile) {
            return res.render("error", { message: "Profile not found." });
        }

        res.render("edit-profile", { profile });
    } catch (error) {
        console.error("Error fetching profile for editing:", error);
        res.render("error", { message: "An error occurred while fetching profile for editing." });
    }
});
// Save updated profile
app.post("/profile/save", async (req, res) => {
    const { username, email, phoneNumber, photo } = req.body;

    try {
        if (!username) {
            return res.status(400).json({ error: "Username is required." });
        }

        let profile = await Profile.findOne({ username });

        if (!profile) {
            return res.status(404).json({ error: "Profile not found." });
        }

        // Update profile fields
        profile.email = email;
        profile.phoneNumber = phoneNumber;

        if (photo) {
            // Handle photo upload if provided
            profile.photo = photo;
        }

        await profile.save();
        res.redirect(`/profile?username=${username}`);
    } catch (error) {
        console.error("Error saving updated profile:", error);
        res.status(500).json({ error: "An error occurred while saving updated profile." });
    }
});
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
