const { processImageToColors, processCubeImage: processImage } = require('../utils/imageProcessing');
const { solveCubeFromState } = require('../algorithms/cubeSolver');
const CubeState = require('../models/CubeState');

const fs = require('fs');
const path = require('path');

// Save cube state
const saveCubeState = async (req, res) => {
    try {
        const { cubeState } = req.body;

        if (!cubeState) {
            return res.status(400).json({ error: 'Cube state is required' });
        }

        // Save to database
        const newCubeState = new CubeState({
            state: cubeState,
            userId: req.user ? req.user.id : null // If using authentication
        });

        await newCubeState.save();

        return res.json({
            success: true,
            message: 'Cube state saved successfully',
            id: newCubeState._id
        });
    } catch (error) {
        console.error('Error saving cube state:', error);
        return res.status(500).json({ error: 'Failed to save cube state' });
    }
};

// Get cube states
const getCubeStates = async (req, res) => {
    try {
        // If using authentication
        const query = req.user ? { userId: req.user.id } : {};

        const cubeStates = await CubeState.find(query).sort({ createdAt: -1 });

        return res.json({ cubeStates });
    } catch (error) {
        console.error('Error getting cube states:', error);
        return res.status(500).json({ error: 'Failed to get cube states' });
    }
};

// Solve cube
const solveCube = async (req, res) => {
    try {
        const { cubeState } = req.body;

        if (!cubeState) {
            return res.status(400).json({ error: 'Cube state is required' });
        }

        // Validate cube state has all required faces
        const requiredFaces = ['U', 'R', 'F', 'D', 'L', 'B'];
        for (const face of requiredFaces) {
            if (!cubeState[face]) {
                return res.status(400).json({ error: `Missing face ${face} in cube state` });
            }

            // Validate each face has 3x3 grid
            if (!Array.isArray(cubeState[face]) || cubeState[face].length !== 3) {
                return res.status(400).json({ error: `Invalid data for face ${face}` });
            }

            for (const row of cubeState[face]) {
                if (!Array.isArray(row) || row.length !== 3) {
                    return res.status(400).json({ error: `Invalid data for face ${face}` });
                }
            }
        }

        // Create solver instance
        const solver = new (require('../algorithms/cubeSolver').RubikCubeSolver)();

        // Solve the cube
        const solution = solver.solve(cubeState);

        if (!solution.success) {
            return res.status(400).json({
                success: false,
                error: solution.error || 'Failed to solve cube'
            });
        }

        return res.json({
            success: true,
            solution: solution.solution,
            steps: solution.steps,
            movesCount: solution.solution.split(' ').filter(m => m.trim() !== '').length
        });
    } catch (error) {
        console.error('Error solving cube:', error);
        return res.status(500).json({ error: 'Failed to solve cube: ' + error.message });
    }
};

// Process cube image using local image processing
const processCubeImage = async (req, res) => {
    try {
        const { face } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        if (!face || !['U', 'R', 'F', 'D', 'L', 'B'].includes(face)) {
            return res.status(400).json({ error: 'Invalid face identifier' });
        }

        // Check file size and type
        const fileSize = req.file.size;
        const fileExt = path.extname(req.file.originalname).toLowerCase();

        if (fileSize > 20 * 1024 * 1024) { // 20MB limit
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Image too large (max 20MB)' });
        }

        if (!['.jpg', '.jpeg', '.png'].includes(fileExt)) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Invalid file format. Only JPG and PNG are supported.' });
        }

        // Process the image to detect colors
        const colorGrid = await processImage(req.file.path, face);

        // Delete the image file after processing
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error(`Failed to delete file: ${req.file.path}`, err);
            } else {
                console.log(`Successfully deleted file: ${req.file.path}`);
            }
        });

        // Return consistent response format
        return res.json({
            success: true,
            face,
            colors: colorGrid
        });
    } catch (error) {
        // Try to delete the file even if processing failed
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, () => { });
        }

        console.error('Error processing cube image:', error);
        return res.status(500).json({ error: 'Failed to process cube image: ' + error.message });
    }
};


// Add a new function to compile all faces into a complete cube state
const compileCubeState = async (req, res) => {
    try {
        const { faces } = req.body;

        if (!faces) {
            return res.status(400).json({ error: 'Faces data is required' });
        }

        // Validate faces data
        const requiredFaces = ['U', 'R', 'F', 'D', 'L', 'B'];
        for (const face of requiredFaces) {
            if (!faces[face]) {
                return res.status(400).json({ error: `Missing face ${face} in input` });
            }
        }

        // Create a complete cube state object
        const cubeState = {
            U: faces.U,
            R: faces.R,
            F: faces.F,
            D: faces.D,
            L: faces.L,
            B: faces.B
        };

        // Save the state to database (optional)
        const newCubeState = new CubeState({
            state: cubeState,
            userId: req.user ? req.user.id : null
        });

        await newCubeState.save();

        // Create solver instance
        const solver = new (require('../algorithms/cubeSolver').RubikCubeSolver)();

        // Solve the cube
        const solution = solver.solve(cubeState);

        if (!solution.success) {
            return res.status(400).json({
                success: false,
                error: solution.error || 'Failed to solve cube'
            });
        }

        return res.json({
            success: true,
            stateId: newCubeState._id,
            solution: solution.solution,
            steps: solution.steps,
            movesCount: solution.solution.split(' ').filter(m => m.trim() !== '').length
        });
    } catch (error) {
        console.error('Error compiling and solving cube:', error);
        return res.status(500).json({ error: 'Failed to compile and solve cube: ' + error.message });
    }
};

module.exports = {
    saveCubeState,
    getCubeStates,
    solveCube,
    processCubeImage,
    compileCubeState
};