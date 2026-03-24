# Location MERN Project

This repository contains a simple MERN (MongoDB, Express, React, Node) scaffold for a location-based app. It allows users to add, view, and delete locations, which are displayed on an interactive map. The project is divided into a backend Express API and a frontend React application.

## Technologies Used

- **MongoDB**: NoSQL database for storing location data.
- **Express**: Web framework for the backend API.
- **React**: JavaScript library for building the user interface.
- **Node.js**: JavaScript runtime for the backend.
- **Vite**: Frontend build tool for a fast development experience.
- **Leaflet**: Library for interactive maps.
- **Tailwind CSS**: Utility-first CSS framework for styling.

## Features

- **Add Locations**: Users can add new locations with a name and coordinates.
- **View on Map**: All locations are displayed on an interactive map.
- **List Locations**: A comprehensive list of all saved locations.
- **Delete Locations**: Functionality to remove locations.
- **Admin Panel**: A simple interface for managing locations.
- **User Dashboards**: Basic dashboards for different roles like drivers and passengers.

## Local Setup

### 1. Backend

```powershell
cd "c:\Users\USER\Desktop\mern_Projects\location project\backend"
copy .env.example .env
# Edit .env to set your MONGO_URI if needed
npm install
npm run seed    # Optional: seeds the database with sample locations
npm run dev     # Starts the development server
```

### 2. Frontend

```powershell
cd "c:\Users\USER\Desktop\mern_Projects\location project\frontend"
copy .env.example .env
npm install
npm run dev
```



