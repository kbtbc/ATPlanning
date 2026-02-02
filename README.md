# AT Thru-Hike Planner

A modern web application for planning an Appalachian Trail thru-hike, replacing traditional spreadsheet tools.

## Features

- **Route Planning:** Calculate ETA for waypoints based on your start date and hiking pace.
- **Resupply Strategy:** Mark waypoints as resupply stops and track upcoming needs.
- **Geolocation:** Find your nearest waypoint on the trail using your device's GPS.
- **Flexible Pacing:** Adjust your daily mileage or use presets (12, 15, 18, 22 mpd) to see how it impacts your schedule.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (usually comes with Node.js)

## Setup & Installation

1.  Clone the repository (if applicable) or navigate to the project directory.
2.  Install dependencies:

    ```bash
    npm install
    ```

## Running the Application

To start the local development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal).

## Running Tests

To run the unit tests for the calculation logic:

```bash
npm test
```

## Tech Stack

- React
- Vite
- date-fns
- Vitest
