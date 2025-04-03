const fs = require('fs');
const path = require('path');

/**
 * Delete a file and log the result
 * @param {string} filePath - Path to the file to delete
 * @returns {Promise<boolean>} - Whether deletion was successful
 */
const deleteFile = (filePath) => {
    return new Promise((resolve) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Failed to delete file: ${filePath}`, err);
                resolve(false);
            } else {
                console.log(`Successfully deleted file: ${filePath}`);
                resolve(true);
            }
        });
    });
};

/**
 * Clean up all files in the uploads directory older than a certain time
 * @param {number} maxAgeMs - Maximum age in milliseconds
 */
const cleanupUploadsDirectory = async (maxAgeMs = 3600000) => { // Default: 1 hour
    const uploadsDir = path.join(__dirname, '../uploads');

    try {
        const files = fs.readdirSync(uploadsDir);
        const now = Date.now();

        for (const file of files) {
            const filePath = path.join(uploadsDir, file);
            const stats = fs.statSync(filePath);

            if (now - stats.mtimeMs > maxAgeMs) {
                await deleteFile(filePath);
            }
        }
    } catch (error) {
        console.error('Error cleaning up uploads directory:', error);
    }
};

module.exports = {
    deleteFile,
    cleanupUploadsDirectory
};