const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Add this import
const cubeController = require('../controllers/cubeController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
const fs = require('fs');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for cube face images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `face-${req.body.face}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Process cube image (removed auth middleware)
router.post('/processCubeImage', upload.single('image'), cubeController.processCubeImage);

// Save cube state (removed auth middleware)
router.post('/state', cubeController.saveCubeState);

// Get cube states (removed auth middleware)
router.get('/states', cubeController.getCubeStates);

// Solve cube (removed auth middleware)
router.post('/solve', cubeController.solveCube);

// Add this new route for compiling and solving
router.post('/compile', cubeController.compileCubeState);

// Add this route for testing the API connection
router.get('/test-gemini', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.json({ success: false, message: 'GEMINI_API_KEY not set in environment variables' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent("What's the standard color scheme for a Rubik's cube?");
        const response = await result.response;
        const text = response.text();

        return res.json({ success: true, message: 'API connection successful', response: text });
    } catch (error) {
        console.error('Error testing Gemini API:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;