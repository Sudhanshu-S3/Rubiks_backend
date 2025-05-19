# Rubik's Cube Solver API

## Overview

This project provides a backend API that allows users to solve a Rubik's cube by processing images of each face. The application uses image recognition to identify colors on each face, then applies algorithms to determine the sequence of moves needed to solve the cube.

## Features

- Image processing to detect colors on Rubik's cube faces
- Advanced cube solving algorithm implementation
- Step-by-step solution with detailed move descriptions
- Stateless API with file cleanup for uploaded images
- Optional user authentication for saving cube states

## Technology Stack

- **Backend**: Node.js, Express.js
- **Image Processing**: Google Gemini AI API
- **Cube Solving**: cube-solver library
- **Authentication**: JWT (JSON Web Tokens)
- **File Management**: Multer for file uploads

## Data Flow

1. **Image Upload**: User uploads images of each cube face
2. **Color Detection**: System processes images to identify colors
3. **Cube State Compilation**: Colors are mapped to create a complete cube state
4. **Solution Generation**: Algorithm determines optimal solution steps
5. **Response**: Returns move sequence with detailed steps for solving

## API Routes

### Cube Operations

- `POST /api/cube/processCubeImage` - Process an image of a cube face

  - Requires: `image` (file) and `face` (U, R, F, D, L, B)
  - Returns: 3x3 grid of detected colors

- `POST /api/cube/state` - Save a cube state

  - Requires: `cubeState` (object with U, R, F, D, L, B faces)
  - Returns: Success confirmation and state ID

- `GET /api/cube/states` - Get saved cube states

  - Returns: List of saved cube states

- `POST /api/cube/solve` - Solve a cube from state

  - Requires: `cubeState` (object with U, R, F, D, L, B faces)
  - Returns: Solution steps and move count

- `POST /api/cube/compile` - Compile faces and solve
  - Requires: `faces` (object with U, R, F, D, L, B faces)
  - Returns: Solution steps, state ID, and move count

### Utility Routes

- `POST /api/upload` - General image upload endpoint

  - Requires: `image` (file)
  - Returns: Path to uploaded file

- `GET /health` - Health check endpoint
  - Returns: API status

### Authentication Routes (if enabled)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

## Installation

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/rubiks-cube-solver.git
   cd rubiks-cube-solver/server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a .env file with the following variables:

   ```
   PORT=23230
   GEMINI_API_KEY=your_google_gemini_api_key
   CLIENT_URL=http://localhost:3000
   ```

4. Start the server:

   ```bash
   npm run dev  # For development
   # or
   npm start    # For production
   ```

5. The server will be running at `http://localhost:23230`

## Testing

1. Access the test page at `http://localhost:23230/test`
2. You can upload images of cube faces using the API endpoints
3. Testing with Postman:
   - Create a new request for `http://localhost:23230/api/cube/processCubeImage`
   - Set the request type to `POST`
   - Under the "Body" tab, select "form-data"
   - Add a key `image` (type: File) and select an image
   - Add a key `face` (type: Text) with value like "U", "R", etc.
   - Send the request and view the detected colors

## Deployment

The project is configured for deployment on Railway with the included railway.json configuration file. It includes:

- Build commands
- Start commands
- Health check endpoint
- Automatic cleanup of uploaded files

## Project Structure

```
server/
├── algorithms/       # Cube solving algorithms
├── controllers/      # API route controllers
├── middleware/       # Authentication middleware
├── models/           # Data models
├── public/           # Static test page
├── routes/           # API route definitions
├── uploads/          # Temporary storage for uploaded images
├── utils/            # Utility functions
├── .env              # Environment variables (create this)
├── .gitignore        # Git ignore file
├── index.js          # Main application entry point
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## License

ISC

## Author

Sudhanshu Shukla
