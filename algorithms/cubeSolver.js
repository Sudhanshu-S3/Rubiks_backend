const CubeSolver = require('cube-solver');
const { MoveNotation } = require('./moveNotation');

// Create an instance of MoveNotation
const moveNotationHelper = new MoveNotation();

class RubikCubeSolver {
    /**
     * Convert our color-based representation to the format cube-solver expects
     */
    convertToNotation(cubeState) {
        // Maps colors to standard cube notation
        const colorMap = {
            'white': 'U',  // Up face
            'yellow': 'D', // Down face
            'red': 'R',    // Right face
            'orange': 'L', // Left face
            'green': 'F',  // Front face
            'blue': 'B',   // Back face
        };

        let notation = '';

        // Process each face in the correct order expected by cube-solver
        // The expected order is: U, R, F, D, L, B
        const faceOrder = ['U', 'R', 'F', 'D', 'L', 'B'];

        for (const face of faceOrder) {
            if (!cubeState[face]) {
                throw new Error(`Missing face in cube state: ${face}`);
            }

            // Flatten the 2D array for this face and convert colors to notation
            for (const row of cubeState[face]) {
                for (const color of row) {
                    if (!colorMap[color.toLowerCase()]) {
                        throw new Error(`Invalid color detected: ${color}`);
                    }
                    notation += colorMap[color.toLowerCase()];
                }
            }
        }

        return notation;
    }

    /**
     * Solve the cube based on the provided state
     */
    solve(cubeState) {
        try {
            // Convert the cube state to notation
            const notation = this.convertToNotation(cubeState);

            // Use the cube-solver library
            const solution = CubeSolver.solve(notation);

            // Parse the solution into steps
            const steps = this.parseSolutionSteps(solution);

            return {
                success: true,
                solution: solution,
                steps: steps
            };
        } catch (error) {
            console.error('Error solving cube:', error);
            return {
                success: false,
                error: error.message || 'Failed to solve cube'
            };
        }
    }

    /**
     * Parse the solution into readable steps with better organization
     */
    parseSolutionSteps(solution) {
        // Split the solution into individual moves
        const moves = solution.split(' ').filter(move => move.trim() !== '');

        // Define the phases of CFOP (Cross, F2L, OLL, PLL)
        const phases = [
            {
                name: 'Cross',
                description: 'Create the white cross on the bottom',
                moves: []
            },
            {
                name: 'F2L (First Two Layers)',
                description: 'Solve the first two layers',
                moves: []
            },
            {
                name: 'OLL (Orient Last Layer)',
                description: 'Orient all pieces on the last layer',
                moves: []
            },
            {
                name: 'PLL (Permute Last Layer)',
                description: 'Permute all pieces on the last layer',
                moves: []
            }
        ];

        // Simple distribution of moves across phases (this is approximate)
        // In a real implementation, you would analyze the moves to determine phases
        const movesPerPhase = Math.ceil(moves.length / phases.length);

        for (let i = 0; i < moves.length; i++) {
            const phaseIndex = Math.min(Math.floor(i / movesPerPhase), phases.length - 1);
            phases[phaseIndex].moves.push(moves[i]);
        }

        // Filter out empty phases and create the step instructions
        return phases
            .filter(phase => phase.moves.length > 0)
            .map(phase => {
                return {
                    name: phase.name,
                    description: phase.description,
                    moves: phase.moves,
                    moveDetails: phase.moves.map(move => moveNotationHelper.getMoveDetails(move))
                };
            });
    }
}

module.exports = {
    RubikCubeSolver
};