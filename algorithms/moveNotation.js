class MoveNotation {
    constructor() {
        // Define basic moves
        this.moves = {
            'R': 'Right face clockwise',
            'R\'': 'Right face counter-clockwise',
            'R2': 'Right face 180 degrees',
            'L': 'Left face clockwise',
            'L\'': 'Left face counter-clockwise',
            'L2': 'Left face 180 degrees',
            'U': 'Up face clockwise',
            'U\'': 'Up face counter-clockwise',
            'U2': 'Up face 180 degrees',
            'D': 'Down face clockwise',
            'D\'': 'Down face counter-clockwise',
            'D2': 'Down face 180 degrees',
            'F': 'Front face clockwise',
            'F\'': 'Front face counter-clockwise',
            'F2': 'Front face 180 degrees',
            'B': 'Back face clockwise',
            'B\'': 'Back face counter-clockwise',
            'B2': 'Back face 180 degrees',
        };
    }

    /**
     * Get description for a move
     */
    getDescription(move) {
        return this.moves[move] || 'Unknown move';
    }

    /**
     * Get axis and direction for a move (for 3D animation)
     */
    getMoveDetails(move) {
        const face = move.charAt(0);
        let direction = 1;
        let turnCount = 1;

        if (move.length > 1) {
            if (move.charAt(1) === '\'') {
                direction = -1;
            } else if (move.charAt(1) === '2') {
                turnCount = 2;
            }
        }

        let axis, selector;

        switch (face) {
            case 'R': // Right face
                axis = 'x';
                selector = (pos) => pos[0] > 0.5;
                break;
            case 'L': // Left face
                axis = 'x';
                direction *= -1;
                selector = (pos) => pos[0] < -0.5;
                break;
            case 'U': // Up face
                axis = 'y';
                selector = (pos) => pos[1] > 0.5;
                break;
            case 'D': // Down face
                axis = 'y';
                direction *= -1;
                selector = (pos) => pos[1] < -0.5;
                break;
            case 'F': // Front face
                axis = 'z';
                selector = (pos) => pos[2] > 0.5;
                break;
            case 'B': // Back face
                axis = 'z';
                direction *= -1;
                selector = (pos) => pos[2] < -0.5;
                break;
            default:
                return null;
        }

        return { axis, direction, turnCount, selector };
    }
}

module.exports = {
    MoveNotation
};