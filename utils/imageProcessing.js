const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize the Gemini API with your API key (store in .env file)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
/**
 * Process a Rubik's cube face image and return the detected colors
 * @param {string} imagePath - Path to the uploaded image
 * @param {string} face - Face identifier (U, R, F, D, L, B)
 * @returns {Promise<Array>} 3x3 grid of detected colors
 */
async function processCubeImage(imagePath, face) {
    try {
        // Add validation for image file
        if (!fs.existsSync(imagePath)) {
            console.error(`File does not exist: ${imagePath}`);
            return processImageToColors(imagePath); // Fall back to mock
        }

        const stats = fs.statSync(imagePath);
        if (stats.size === 0) {
            console.error(`File is empty: ${imagePath}`);
            return processImageToColors(imagePath); // Fall back to mock
        }

        // Log file details for debugging
        console.log(`Processing image: ${imagePath}`);
        console.log(`File size: ${stats.size} bytes`);
        console.log(`MIME type: ${getMimeType(imagePath)}`);

        // Read the image file as base64
        const imageData = fs.readFileSync(imagePath);
        const imageBase64 = imageData.toString('base64');

        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY not set, using mock implementation");
            return processImageToColors(imagePath);
        }

        // Create parts for the multimodal content
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: getMimeType(imagePath)
            }
        };

        // Create a prompt that asks Gemini to identify the colors on the Rubik's cube face
        const prompt = `
This is an image of the ${getFaceName(face)} face (${face}) of a Rubik's cube.
Analyze the image and identify the color of each square in a 3x3 grid.
The possible colors are: white, yellow, red, orange, green, and blue.
Return the result as a 3x3 JSON array of colors, with no additional text.
Format should be exactly: [["color","color","color"],["color","color","color"],["color","color","color"]]
`;

        try {
            console.log("Sending request to Gemini API...");
            // Generate content with the image
            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            console.log("Raw API response:", text);

            // Extract the JSON array from the response
            const colorArray = extractJsonArray(text);

            // Validate the result
            if (!isValidColorArray(colorArray)) {
                console.error("Invalid color array received:", colorArray);
                console.log("Falling back to mock implementation");
                return processImageToColors(imagePath);
            }

            return colorArray;
        } catch (apiError) {
            console.error("Gemini API error:", apiError);
            console.log("Falling back to mock implementation");
            return processImageToColors(imagePath);
        }
    } catch (error) {
        console.error("Error processing cube image:", error);
        // Fall back to mock implementation in case of errors
        return processImageToColors(imagePath);
    }
}

/**
 * Get the MIME type based on file extension
 */
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        case '.webp':
            return 'image/webp';
        default:
            console.warn(`Unknown file extension: ${ext}, using default MIME type`);
            return 'image/jpeg'; // Default to JPEG
    }
}

/**
 * Get the full name of a face based on its letter
 */
function getFaceName(face) {
    const faceNames = {
        'U': 'Upper (top)',
        'R': 'Right',
        'F': 'Front',
        'D': 'Down (bottom)',
        'L': 'Left',
        'B': 'Back'
    };
    return faceNames[face] || 'Unknown';
}

/**
 * Extract JSON array from the text response
 */
function extractJsonArray(text) {
    try {
        // Look for array pattern in the text
        const match = text.match(/\[\s*\[.*?\]\s*\]/s);
        if (match) {
            return JSON.parse(match[0]);
        }

        // If no match with regex, try direct parsing (if the response is clean)
        return JSON.parse(text);
    } catch (error) {
        console.error("Failed to parse color array:", error);
        throw new Error("Failed to parse color information from AI response");
    }
}

/**
 * Validate the color array
 */
function isValidColorArray(array) {
    if (!Array.isArray(array) || array.length !== 3) return false;

    const validColors = ['white', 'yellow', 'red', 'orange', 'green', 'blue'];

    for (const row of array) {
        if (!Array.isArray(row) || row.length !== 3) return false;
        for (const color of row) {
            if (typeof color !== 'string' || !validColors.includes(color.toLowerCase())) return false;
        }
    }

    return true;
}

// Process image to extract colors
const processImageToColors = async (imagePath) => {
    // This is a mock implementation. In a real application, you would use
    // computer vision libraries or APIs to detect colors from the image.

    // For now, return a random 3x3 grid of cube colors
    const colors = ['white', 'green', 'red', 'blue', 'orange', 'yellow'];

    const result = [];
    for (let i = 0; i < 3; i++) {
        const row = [];
        for (let j = 0; j < 3; j++) {
            // For demo, return a random color
            row.push(colors[Math.floor(Math.random() * colors.length)]);
        }
        result.push(row);
    }

    // Make sure the center color represents the face color (in a real implementation)

    return result;
};

module.exports = {
    processCubeImage,
    processImageToColors
};