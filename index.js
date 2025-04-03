const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();
const { cleanupUploadsDirectory } = require('./utils/fileCleanup');

// Check for required environment variables
if (!process.env.GEMINI_API_KEY) {
    console.warn("Warning: GEMINI_API_KEY environment variable is not set. Image processing will use mock implementation.");
}

// Import routes
const cubeRoutes = require('./routes/cubeRoutes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['https://your-vercel-app.vercel.app', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Configure file uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Routes - only cube routes, no auth routes
app.use('/api/cube', cubeRoutes);

// Upload endpoint for single image
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
    }

    res.json({
        success: true,
        filename: req.file.filename,
        path: req.file.path
    });
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the static test page
app.use('/test', express.static(path.join(__dirname, 'public')));

// Add a root redirect to the test page
app.get('/', (req, res) => {
    res.redirect('/test');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT}/test to test the solver`);
});

// Clean up uploads directory every hour
setInterval(() => {
    cleanupUploadsDirectory();
}, 3600000); // 1 hour

// Also clean up on startup
cleanupUploadsDirectory();

// Export app for testing
module.exports = app;