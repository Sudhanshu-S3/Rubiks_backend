// Using a simpler implementation without MongoDB for now
class CubeState {
    constructor(data) {
        this.state = data.state || {};
        this.userId = data.userId || null;
        this.createdAt = new Date();
        this._id = Date.now().toString();
    }

    async save() {
        // Mock implementation
        return this;
    }

    static async find(query) {
        // Mock implementation
        return [];
    }
}

module.exports = CubeState;