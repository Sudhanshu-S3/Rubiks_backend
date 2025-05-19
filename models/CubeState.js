const mongoose = require('mongoose');

const cubeStateSchema = new mongoose.Schema({
    state: {
        type: Object,
        required: true,
        // Define nested structure for cube faces
        validate: {
            validator: function (state) {
                const requiredFaces = ['U', 'R', 'F', 'D', 'L', 'B'];
                // Check if all faces exist
                return requiredFaces.every(face =>
                    state[face] &&
                    Array.isArray(state[face]) &&
                    state[face].length === 3 &&
                    state[face].every(row => Array.isArray(row) && row.length === 3)
                );
            },
            message: 'Cube state must include all faces (U, R, F, D, L, B) with 3x3 grid'
        }
    },
    userId: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add index for faster querying by userId
cubeStateSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CubeState', cubeStateSchema);