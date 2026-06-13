# SCORPIO Website

SCORPIO Website is the frontend interface for the SCORPIO platform, an Edge-to-Cloud system for visualizing ground stations, satellites, and received telemetry packets.

The website provides an interactive 3D globe where users can explore ground stations, inspect their status, and visualize satellite-related packet information.

## Requirements

Before running the project locally, make sure you have installed:

* Node.js
* npm

## Local Setup

Clone the repository:

```bash
git clone <repository-url>
cd scorpio-website
```

Install dependencies:

```bash
npm install
```

Create a local environment file if needed:

```bash
cp .env.example .env
```

Update the API URL in the `.env` file:

```bash
VITE_API_URL=http://localhost:3000
```

Run the development server:

```bash
npm run dev
```

The website should now be available at:

```bash
http://localhost:5173
```

## Backend

This frontend expects the SCORPIO backend API to be running locally, usually at:

```bash
http://localhost:3000
```

Make sure the backend is active before testing API-dependent features such as stations, satellites, and packets.

## Project Status

This project is under active development as part of the SCORPIO Edge-to-Cloud satellite telemetry platform.
