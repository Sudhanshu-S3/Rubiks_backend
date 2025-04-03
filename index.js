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
    origin: ['https://your-vercel-app.vercel.app', 'http://localhost:3000', process.env.CLIENT_URL],
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

// Add a dedicated health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

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

// Serve the static test page if public folder exists
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
    app.use('/test', express.static(publicDir));
} else {
    app.get('/test', (req, res) => {
        res.send('Test page would be here if public directory existed.');
    });
}

// Add a root redirect to the health check when in production
app.get('/', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        res.redirect('/health');
    } else {
        res.redirect('/test');
    }
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