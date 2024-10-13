# Simple Robinhood Clone

This project is a simplified clone of Robinhood, a stock trading platform. It consists of a React frontend and a Flask backend.

## Prerequisites

- Node.js (v14 or later)
- Python (v3.7 or later)
- pip (Python package installer)

## Setup

### Backend

1. Navigate to the backend directory:
   ```sh
   cd backend
   ```

2. Create a virtual environment:
   ```sh
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```sh
     venv\Scripts\activate
     ```
   - On macOS and Linux:
     ```sh
     source venv/bin/activate
     ```

4. Install the required Python packages:
   ```sh
   pip install -r requirements.txt
   ```

5. Set up your environment variables:
   Create a `.env` file in the backend directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

6. Run the Flask server:
   ```sh
   python3 app.py
   ```

### Frontend

1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```

2. Install the required npm packages:
   ```sh
   npm install
   ```

3. Start the React development server:
   ```sh
   npm start
   ```

## Usage

Open your web browser and go to `http://localhost:3000` to use the application.

## Features

- Query stock information
- Buy and sell stocks
- View portfolio
- Get AI-generated portfolio review
- Real-time portfolio updates via WebSocket

## Technologies Used

- Frontend: React, Chakra UI, Recharts
- Backend: Flask, SQLAlchemy, yfinance
- Database: SQLite
- Real-time updates: Socket.IO
- AI Integration: OpenAI GPT-3.5-turbo
